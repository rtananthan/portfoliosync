import json
import os
import logging
import requests
from datetime import datetime
from typing import Dict, Any, List

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Import shared utilities
import sys
sys.path.append('/opt/python')
sys.path.append(os.path.join(os.path.dirname(__file__), '../../shared'))

from dynamodb_client import db_client
from response_utils import success_response, internal_error_response

def get_stock_price(symbol: str, api_key: str) -> float:
    """
    Get current stock price from Alpha Vantage API
    """
    try:
        url = f"https://www.alphavantage.co/query"
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': api_key
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        # Check for API limit or error
        if 'Error Message' in data:
            logger.error(f"API Error for {symbol}: {data['Error Message']}")
            return None
        
        if 'Note' in data:
            logger.warning(f"API limit reached: {data['Note']}")
            return None
        
        # Extract price from response
        quote = data.get('Global Quote', {})
        price_str = quote.get('05. price')
        
        if price_str:
            return float(price_str)
        else:
            logger.error(f"No price data found for {symbol}")
            return None
            
    except Exception as e:
        logger.error(f"Error fetching price for {symbol}: {str(e)}")
        return None

def update_stock_prices():
    """
    Update prices for all stocks
    """
    try:
        # Get API key
        api_key = os.environ.get('ALPHA_VANTAGE_API_KEY')
        if not api_key:
            logger.error("ALPHA_VANTAGE_API_KEY not set")
            return False
        
        # Get table names
        stocks_table = os.environ.get('STOCKS_TABLE')
        etfs_table = os.environ.get('ETFS_TABLE')
        price_history_table = os.environ.get('PRICE_HISTORY_TABLE')
        
        if not all([stocks_table, etfs_table, price_history_table]):
            logger.error("Required table environment variables not set")
            return False
        
        updated_count = 0
        
        # Update stock prices
        stocks = db_client.scan_table(stocks_table)
        for stock in stocks:
            symbol = stock['symbol']
            new_price = get_stock_price(symbol, api_key)
            
            if new_price:
                # Calculate new values
                quantity = stock['quantity']
                average_price = stock['averagePrice']
                total_value = quantity * new_price
                total_cost = quantity * average_price
                total_return = total_value - total_cost
                return_percentage = (total_return / total_cost) * 100 if total_cost > 0 else 0.0
                
                # Update stock record
                db_client.update_item(
                    table_name=stocks_table,
                    key={'id': stock['id']},
                    update_expression='SET currentPrice = :price, totalValue = :value, totalReturn = :return, returnPercentage = :percentage, updatedAt = :updated',
                    expression_values={
                        ':price': new_price,
                        ':value': total_value,
                        ':return': total_return,
                        ':percentage': return_percentage,
                        ':updated': datetime.utcnow().isoformat()
                    }
                )
                
                # Save price history
                db_client.put_item(price_history_table, {
                    'symbol': symbol,
                    'date': datetime.utcnow().isoformat(),
                    'price': new_price
                })
                
                updated_count += 1
                logger.info(f"Updated {symbol}: ${new_price}")
        
        # Update ETF prices (similar logic)
        etfs = db_client.scan_table(etfs_table)
        for etf in etfs:
            symbol = etf['symbol']
            new_price = get_stock_price(symbol, api_key)
            
            if new_price:
                # Calculate new values
                quantity = etf['quantity']
                average_price = etf['averagePrice']
                total_value = quantity * new_price
                total_cost = quantity * average_price
                total_return = total_value - total_cost
                return_percentage = (total_return / total_cost) * 100 if total_cost > 0 else 0.0
                
                # Update ETF record
                db_client.update_item(
                    table_name=etfs_table,
                    key={'id': etf['id']},
                    update_expression='SET currentPrice = :price, totalValue = :value, totalReturn = :return, returnPercentage = :percentage, updatedAt = :updated',
                    expression_values={
                        ':price': new_price,
                        ':value': total_value,
                        ':return': total_return,
                        ':percentage': return_percentage,
                        ':updated': datetime.utcnow().isoformat()
                    }
                )
                
                # Save price history
                db_client.put_item(price_history_table, {
                    'symbol': symbol,
                    'date': datetime.utcnow().isoformat(),
                    'price': new_price
                })
                
                updated_count += 1
                logger.info(f"Updated {symbol}: ${new_price}")
        
        logger.info(f"Updated prices for {updated_count} securities")
        return True
        
    except Exception as e:
        logger.error(f"Error updating prices: {str(e)}")
        return False

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Scheduled function to update all security prices
    """
    try:
        logger.info("Starting price update job")
        
        success = update_stock_prices()
        
        if success:
            return success_response({
                'message': 'Price update completed successfully',
                'timestamp': datetime.utcnow().isoformat()
            })
        else:
            return internal_error_response("Price update failed")
        
    except Exception as e:
        logger.error(f"Error in price update handler: {str(e)}")
        return internal_error_response("Price update failed")