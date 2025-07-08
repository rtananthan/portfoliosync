import os
import requests
import logging
import boto3
import json
from typing import Dict, Any, Optional
from decimal import Decimal
import time

logger = logging.getLogger()

class MarketDataService:
    def __init__(self):
        self.alpha_vantage_key = None
        self.finnhub_key = None
        self.session = requests.Session()
        self.secrets_client = boto3.client('secretsmanager')
        
        # Load API keys from Secrets Manager
        self._load_api_keys()
    
    def _load_api_keys(self):
        """Load API keys from AWS Secrets Manager"""
        try:
            # Try to get Alpha Vantage API key
            try:
                response = self.secrets_client.get_secret_value(
                    SecretId='portfoliosync/alpha-vantage-api-key'
                )
                self.alpha_vantage_key = response['SecretString']
                logger.info("Alpha Vantage API key loaded from Secrets Manager")
            except Exception as e:
                logger.warning(f"Could not load Alpha Vantage API key from Secrets Manager: {str(e)}")
                # Fallback to environment variable
                self.alpha_vantage_key = os.environ.get('ALPHA_VANTAGE_API_KEY')
                if self.alpha_vantage_key:
                    logger.info("Alpha Vantage API key loaded from environment variable")
            
            # Try to get Finnhub API key
            try:
                response = self.secrets_client.get_secret_value(
                    SecretId='portfoliosync/finnhub-api-key'
                )
                self.finnhub_key = response['SecretString']
                logger.info("Finnhub API key loaded from Secrets Manager")
            except Exception as e:
                logger.warning(f"Could not load Finnhub API key from Secrets Manager: {str(e)}")
                # Fallback to environment variable
                self.finnhub_key = os.environ.get('FINNHUB_API_KEY')
                if self.finnhub_key:
                    logger.info("Finnhub API key loaded from environment variable")
                    
        except Exception as e:
            logger.error(f"Error loading API keys: {str(e)}")
            # Fallback to environment variables
            self.alpha_vantage_key = os.environ.get('ALPHA_VANTAGE_API_KEY')
            self.finnhub_key = os.environ.get('FINNHUB_API_KEY')
        
    def get_stock_price(self, symbol: str, force_refresh: bool = False) -> Optional[Dict[str, Any]]:
        """
        Get current stock price from available APIs with caching
        
        Args:
            symbol: Stock symbol to get price for
            force_refresh: If True, bypass cache and fetch fresh data
            
        Returns: {
            'symbol': str,
            'price': Decimal,
            'change': Decimal,
            'change_percent': Decimal,
            'currency': str,
            'timestamp': str,
            'source': str,
            'cached': bool,
            'age_hours': float
        }
        """
        # Check cache first (unless force refresh requested)
        if not force_refresh:
            cached_price = self._get_cached_price(symbol)
            if cached_price:
                return cached_price
        
        # Fetch fresh data from APIs
        fresh_data = self._fetch_fresh_price(symbol)
        
        if fresh_data:
            # Cache the fresh data
            self._cache_price(symbol, fresh_data)
            fresh_data['cached'] = False
            fresh_data['age_hours'] = 0.0
            return fresh_data
        
        # If fresh fetch failed, try to return stale cache as fallback
        stale_cache = self._get_cached_price(symbol, allow_stale=True)
        if stale_cache:
            logger.warning(f"Using stale cache for {symbol}, fresh fetch failed")
            return stale_cache
        
        return None
    
    def _fetch_fresh_price(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Fetch fresh price data from APIs"""
        # Try Finnhub first (it's generally faster for real-time data)
        if self.finnhub_key:
            try:
                result = self._get_price_from_finnhub(symbol)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Finnhub API failed for {symbol}: {str(e)}")
        
        # Fallback to Alpha Vantage
        if self.alpha_vantage_key:
            try:
                result = self._get_price_from_alpha_vantage(symbol)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Alpha Vantage API failed for {symbol}: {str(e)}")
        
        # Final fallback: Demo mode with realistic mock data
        logger.warning(f"No API keys available, using demo mode for {symbol}")
        return self._get_demo_price(symbol)
    
    def _get_price_from_finnhub(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get price from Finnhub API"""
        try:
            # Get current price
            quote_url = f"https://finnhub.io/api/v1/quote"
            params = {
                'symbol': symbol,
                'token': self.finnhub_key
            }
            
            response = self.session.get(quote_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Check if we got valid data
            if not data or 'c' not in data or data['c'] == 0:
                logger.warning(f"Finnhub returned no data for {symbol}")
                return None
            
            current_price = Decimal(str(data['c']))  # Current price
            change = Decimal(str(data.get('d', 0)))  # Change
            change_percent = Decimal(str(data.get('dp', 0)))  # Change percent
            
            return {
                'symbol': symbol.upper(),
                'price': current_price,
                'change': change,
                'change_percent': change_percent,
                'currency': 'USD',  # Finnhub primarily provides USD prices
                'timestamp': str(int(time.time())),
                'source': 'Finnhub'
            }
            
        except Exception as e:
            logger.error(f"Finnhub API error for {symbol}: {str(e)}")
            raise
    
    def _get_price_from_alpha_vantage(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get price from Alpha Vantage API"""
        try:
            # Use Global Quote endpoint for real-time data
            url = f"https://www.alphavantage.co/query"
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': symbol,
                'apikey': self.alpha_vantage_key
            }
            
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            # Check for API limit or error
            if 'Error Message' in data:
                logger.error(f"Alpha Vantage error: {data['Error Message']}")
                return None
            
            if 'Note' in data:
                logger.warning(f"Alpha Vantage rate limit: {data['Note']}")
                return None
            
            # Extract data from Global Quote
            quote = data.get('Global Quote', {})
            if not quote:
                logger.warning(f"Alpha Vantage returned no quote data for {symbol}")
                return None
            
            current_price = Decimal(str(quote.get('05. price', 0)))
            change = Decimal(str(quote.get('09. change', 0)))
            change_percent_str = quote.get('10. change percent', '0%').replace('%', '')
            change_percent = Decimal(str(change_percent_str))
            
            if current_price == 0:
                logger.warning(f"Alpha Vantage returned zero price for {symbol}")
                return None
            
            return {
                'symbol': symbol.upper(),
                'price': current_price,
                'change': change,
                'change_percent': change_percent,
                'currency': 'USD',
                'timestamp': str(int(time.time())),
                'source': 'Alpha Vantage'
            }
            
        except Exception as e:
            logger.error(f"Alpha Vantage API error for {symbol}: {str(e)}")
            raise
    
    def get_multiple_prices(self, symbols: list, force_refresh: bool = False) -> Dict[str, Dict[str, Any]]:
        """
        Get prices for multiple symbols
        Returns dict with symbol as key and price data as value
        """
        results = {}
        
        for symbol in symbols:
            try:
                price_data = self.get_stock_price(symbol, force_refresh=force_refresh)
                if price_data:
                    results[symbol.upper()] = price_data
                else:
                    logger.warning(f"Failed to get price for {symbol}")
                    
                # Add small delay to avoid rate limiting (only for fresh fetches)
                if not price_data or not price_data.get('cached', False):
                    time.sleep(0.1)
                
            except Exception as e:
                logger.error(f"Error getting price for {symbol}: {str(e)}")
                continue
        
        return results
    
    def _get_cached_price(self, symbol: str, allow_stale: bool = False) -> Optional[Dict[str, Any]]:
        """
        Get cached price data if it's fresh enough
        
        Args:
            symbol: Stock symbol
            allow_stale: If True, return cached data even if older than 3 hours
        """
        try:
            # Use DynamoDB to store price cache
            from dynamodb_client import db_client
            
            table_name = os.environ.get('PRICE_HISTORY_TABLE')
            if not table_name:
                logger.warning("PRICE_HISTORY_TABLE not configured, skipping cache")
                return None
            
            # Get the most recent cache entry for this symbol
            # Query by symbol (partition key) and get all entries, then find the latest
            table = db_client.get_table(table_name)
            response = table.query(
                KeyConditionExpression='symbol = :symbol',
                ExpressionAttributeValues={':symbol': symbol.upper()},
                ScanIndexForward=False,  # Sort by date descending
                Limit=1  # Only get the latest entry
            )
            
            items = response.get('Items', [])
            
            if not items:
                return None
            
            # Get the most recent entry (should be sorted by date desc)
            latest_entry = items[0]
            
            # Check if cache is fresh enough
            cache_timestamp = int(latest_entry.get('timestamp', 0))
            current_timestamp = int(time.time())
            age_seconds = current_timestamp - cache_timestamp
            age_hours = age_seconds / 3600.0
            
            # Use cache if less than 3 hours old (or if stale is allowed)
            if age_hours < 3.0 or allow_stale:
                logger.info(f"Using cached price for {symbol} (age: {age_hours:.1f}h)")
                
                cached_data = {
                    'symbol': symbol.upper(),
                    'price': Decimal(str(latest_entry.get('price', 0))),
                    'change': Decimal(str(latest_entry.get('change', 0))),
                    'change_percent': Decimal(str(latest_entry.get('change_percent', 0))),
                    'currency': latest_entry.get('currency', 'USD'),
                    'timestamp': str(cache_timestamp),
                    'source': f"{latest_entry.get('source', 'Cache')} (cached {age_hours:.1f}h ago)",
                    'cached': True,
                    'age_hours': age_hours
                }
                return cached_data
            
            logger.info(f"Cache for {symbol} is stale ({age_hours:.1f}h old), fetching fresh data")
            return None
            
        except Exception as e:
            logger.warning(f"Error checking cache for {symbol}: {str(e)}")
            return None
    
    def _cache_price(self, symbol: str, price_data: Dict[str, Any]) -> None:
        """Cache price data to DynamoDB"""
        try:
            from dynamodb_client import db_client
            
            table_name = os.environ.get('PRICE_HISTORY_TABLE')
            if not table_name:
                logger.warning("PRICE_HISTORY_TABLE not configured, skipping cache")
                return
            
            # Create cache entry
            cache_entry = {
                'symbol': symbol.upper(),
                'date': str(int(time.time())),  # Use timestamp as sort key
                'price': price_data['price'],
                'change': price_data['change'],
                'change_percent': price_data['change_percent'],
                'currency': price_data['currency'],
                'timestamp': int(price_data['timestamp']),
                'source': price_data['source'],
                'cached_at': int(time.time())
            }
            
            db_client.put_item(table_name=table_name, item=cache_entry)
            logger.info(f"Cached price for {symbol}")
            
        except Exception as e:
            logger.warning(f"Error caching price for {symbol}: {str(e)}")
    
    def _get_demo_price(self, symbol: str) -> Dict[str, Any]:
        """
        Get demo/mock price data for testing when API keys are not available
        """
        import random
        
        # Common stock prices for demo
        demo_prices = {
            'AAPL': Decimal('175.25'),
            'GOOGL': Decimal('142.50'), 
            'MSFT': Decimal('415.75'),
            'AMZN': Decimal('168.35'),
            'TSLA': Decimal('248.90'),
            'NVDA': Decimal('820.45'),
            'META': Decimal('515.20'),
            'NFLX': Decimal('485.60'),
            'AMD': Decimal('135.80'),
            'INTC': Decimal('28.75'),
        }
        
        # Get base price or generate a random one
        base_price = demo_prices.get(symbol.upper(), Decimal(str(random.uniform(20, 300))))
        
        # Add some random variation (+/- 5%)
        variation = random.uniform(-0.05, 0.05)
        current_price = base_price * (Decimal('1') + Decimal(str(variation)))
        
        # Calculate change
        change = current_price - base_price
        change_percent = (change / base_price) * Decimal('100')
        
        return {
            'symbol': symbol.upper(),
            'price': round(current_price, 2),
            'change': round(change, 2),
            'change_percent': round(change_percent, 2),
            'currency': 'USD',
            'timestamp': str(int(time.time())),
            'source': 'Demo Mode (Get real API keys for live data)'
        }

# Singleton instance
market_data_service = MarketDataService()