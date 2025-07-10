import json
import boto3
import os
import requests
import uuid
from datetime import datetime, timedelta
from boto3.dynamodb.conditions import Key
import logging

# Import shared modules
import sys
sys.path.append('/opt/python')
sys.path.append('../../shared')

from response_utils import create_response, handle_error

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
news_table = dynamodb.Table(os.environ['NEWS_TABLE'])
stocks_table = dynamodb.Table(os.environ['STOCKS_TABLE'])
etfs_table = dynamodb.Table(os.environ['ETFS_TABLE'])

def handler(event, context):
    """
    Refresh news for a specific symbol or all symbols (daily cron job)
    """
    try:
        # Check if this is a scheduled event (daily refresh) or API call
        is_scheduled = 'source' in event and event['source'] == 'aws.events'
        
        if is_scheduled:
            logger.info("Daily news refresh triggered by schedule")
            symbols = get_all_portfolio_symbols()
        else:
            # Get symbol from path parameters
            symbol = event.get('pathParameters', {}).get('symbol')
            if not symbol:
                return handle_error("Symbol is required", 400)
            symbols = [symbol.upper()]
        
        logger.info(f"Refreshing news for symbols: {symbols}")
        
        # Process each symbol
        results = []
        for symbol in symbols:
            try:
                result = refresh_symbol_news(symbol)
                results.append(result)
            except Exception as e:
                logger.error(f"Error refreshing news for {symbol}: {str(e)}")
                results.append({
                    'symbol': symbol,
                    'success': False,
                    'error': str(e)
                })
        
        # Summary
        successful = len([r for r in results if r.get('success', False)])
        total = len(results)
        
        logger.info(f"News refresh completed: {successful}/{total} symbols successful")
        
        return create_response(200, {
            'message': f'News refresh completed for {total} symbols',
            'successful': successful,
            'total': total,
            'results': results,
            'isScheduled': is_scheduled
        })
        
    except Exception as e:
        logger.error(f"Error in news refresh: {str(e)}")
        return handle_error(f"News refresh failed: {str(e)}", 500)

def get_all_portfolio_symbols():
    """Get all unique symbols from stocks and ETFs tables"""
    symbols = set()
    
    try:
        # Get all stocks
        stocks_response = stocks_table.scan(
            ProjectionExpression='symbol'
        )
        for item in stocks_response.get('Items', []):
            if 'symbol' in item:
                symbols.add(item['symbol'].upper())
        
        # Get all ETFs
        etfs_response = etfs_table.scan(
            ProjectionExpression='symbol'
        )
        for item in etfs_response.get('Items', []):
            if 'symbol' in item:
                symbols.add(item['symbol'].upper())
                
        logger.info(f"Found {len(symbols)} unique symbols in portfolios")
        return list(symbols)
        
    except Exception as e:
        logger.error(f"Error getting portfolio symbols: {str(e)}")
        return []

def refresh_symbol_news(symbol):
    """Refresh news for a specific symbol"""
    try:
        logger.info(f"Refreshing news for symbol: {symbol}")
        
        # Check if we already have recent news (within last 12 hours)
        twelve_hours_ago = (datetime.utcnow() - timedelta(hours=12)).isoformat()
        
        recent_news = news_table.query(
            IndexName='symbol-publishedAt-index',
            KeyConditionExpression=Key('symbol').eq(symbol) & 
                                 Key('publishedAt').gte(twelve_hours_ago),
            Limit=1
        )
        
        if recent_news.get('Items'):
            logger.info(f"Recent news exists for {symbol}, skipping refresh")
            return {
                'symbol': symbol,
                'success': True,
                'action': 'skipped',
                'reason': 'Recent news already exists',
                'recentCount': len(recent_news['Items'])
            }
        
        # Fetch news from external source (placeholder implementation)
        news_items = fetch_news_from_source(symbol)
        
        if not news_items:
            logger.info(f"No new news found for {symbol}")
            return {
                'symbol': symbol,
                'success': True,
                'action': 'no_news',
                'newItems': 0
            }
        
        # Store news items in database
        stored_count = 0
        for news_item in news_items:
            try:
                # Generate unique ID
                news_id = str(uuid.uuid4())
                
                # Calculate TTL (30 days from now)
                ttl = int((datetime.utcnow() + timedelta(days=30)).timestamp())
                
                # Prepare news item for storage
                item = {
                    'id': news_id,
                    'symbol': symbol,
                    'headline': news_item.get('headline', ''),
                    'summary': news_item.get('summary', ''),
                    'sourceUrl': news_item.get('url', ''),
                    'sourceName': news_item.get('source', 'Unknown'),
                    'publishedAt': news_item.get('publishedAt', datetime.utcnow().isoformat()),
                    'analyzedAt': datetime.utcnow().isoformat(),
                    'ttl': ttl,
                    'assetType': determine_asset_type(symbol),
                    'status': 'pending_analysis',  # Will be updated by Bedrock analysis
                    'tags': news_item.get('tags', []),
                    'rawData': news_item  # Store original data for reference
                }
                
                # Store in DynamoDB
                news_table.put_item(Item=item)
                stored_count += 1
                
            except Exception as e:
                logger.error(f"Error storing news item for {symbol}: {str(e)}")
        
        logger.info(f"Stored {stored_count} news items for {symbol}")
        
        return {
            'symbol': symbol,
            'success': True,
            'action': 'refreshed',
            'newItems': stored_count,
            'totalFetched': len(news_items)
        }
        
    except Exception as e:
        logger.error(f"Error refreshing news for {symbol}: {str(e)}")
        raise

def fetch_news_from_source(symbol):
    """
    Fetch news from external source (placeholder implementation)
    In production, this would integrate with news APIs like:
    - Alpha Vantage News
    - Financial Modeling Prep
    - NewsAPI
    - Polygon.io
    """
    try:
        # For now, return mock data to test the infrastructure
        # TODO: Replace with real news API integration
        
        logger.info(f"Fetching news for {symbol} (mock implementation)")
        
        # Mock news data
        mock_news = [
            {
                'headline': f'{symbol} Shows Strong Performance in Latest Quarter',
                'summary': f'Recent analysis of {symbol} indicates positive market sentiment and strong fundamentals.',
                'url': f'https://example.com/news/{symbol.lower()}-performance',
                'source': 'Financial News Network',
                'publishedAt': datetime.utcnow().isoformat(),
                'tags': ['earnings', 'performance', 'quarterly-results']
            },
            {
                'headline': f'Analyst Upgrade for {symbol} Based on Market Outlook',
                'summary': f'Leading analysts have upgraded their outlook for {symbol} citing favorable market conditions.',
                'url': f'https://example.com/news/{symbol.lower()}-upgrade',
                'source': 'Market Analysis Today',
                'publishedAt': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                'tags': ['analyst-rating', 'upgrade', 'market-outlook']
            }
        ]
        
        # Only return mock data occasionally to avoid spam
        import random
        if random.random() < 0.3:  # 30% chance of returning mock news
            return mock_news
        else:
            return []
        
    except Exception as e:
        logger.error(f"Error fetching news from source: {str(e)}")
        return []

def determine_asset_type(symbol):
    """Determine if symbol is a stock or ETF based on our database"""
    try:
        # Check if it's in stocks table
        stocks_response = stocks_table.query(
            IndexName='symbol-index',  # Assuming we have a GSI on symbol
            KeyConditionExpression=Key('symbol').eq(symbol),
            Limit=1
        )
        
        if stocks_response.get('Items'):
            return 'stock'
        
        # Check if it's in ETFs table
        etfs_response = etfs_table.query(
            IndexName='symbol-index',  # Assuming we have a GSI on symbol
            KeyConditionExpression=Key('symbol').eq(symbol),
            Limit=1
        )
        
        if etfs_response.get('Items'):
            return 'etf'
        
        # Default to stock if not found
        return 'stock'
        
    except Exception as e:
        logger.warning(f"Error determining asset type for {symbol}: {str(e)}")
        return 'stock'