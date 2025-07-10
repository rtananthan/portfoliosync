import json
import boto3
import os
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

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
news_table = dynamodb.Table(os.environ['NEWS_TABLE'])

def handler(event, context):
    """
    Get recent news items across all symbols
    """
    try:
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        limit = int(query_params.get('limit', '20'))
        days = int(query_params.get('days', '3'))
        symbols = query_params.get('symbols', '').split(',') if query_params.get('symbols') else None
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        start_date_str = start_date.isoformat()
        
        logger.info(f"Fetching all news, limit: {limit}, days: {days}, symbols: {symbols}")
        
        if symbols and len(symbols) > 0 and symbols[0]:
            # Fetch news for specific symbols
            all_news = []
            for symbol in symbols:
                symbol = symbol.strip().upper()
                if not symbol:
                    continue
                    
                response = news_table.query(
                    IndexName='symbol-publishedAt-index',
                    KeyConditionExpression=Key('symbol').eq(symbol) & 
                                         Key('publishedAt').gte(start_date_str),
                    ScanIndexForward=False,
                    Limit=min(limit // len(symbols) + 5, 20)  # Distribute limit across symbols
                )
                all_news.extend(response.get('Items', []))
        else:
            # Fetch recent news across all symbols using publishedAt index
            response = news_table.query(
                IndexName='publishedAt-index',
                KeyConditionExpression=Key('publishedAt').gte(start_date_str),
                ScanIndexForward=False,
                Limit=limit * 2  # Get more to account for filtering
            )
            all_news = response.get('Items', [])
        
        # Sort by publishedAt descending and limit results
        all_news.sort(key=lambda x: x.get('publishedAt', ''), reverse=True)
        all_news = all_news[:limit]
        
        # Group by symbol for easier frontend consumption
        news_by_symbol = {}
        for item in all_news:
            symbol = item.get('symbol')
            if symbol not in news_by_symbol:
                news_by_symbol[symbol] = []
            news_by_symbol[symbol].append(item)
        
        logger.info(f"Found {len(all_news)} news items across {len(news_by_symbol)} symbols")
        
        return create_response(200, {
            'news': all_news,
            'newsBySymbol': news_by_symbol,
            'count': len(all_news),
            'symbolCount': len(news_by_symbol),
            'dateRange': {
                'from': start_date_str,
                'to': end_date.isoformat()
            },
            'requestedSymbols': symbols
        })
        
    except ValueError as e:
        return handle_error(f"Invalid parameter: {str(e)}", 400)
    except Exception as e:
        logger.error(f"Error fetching all news: {str(e)}")
        return handle_error(f"Failed to fetch news: {str(e)}", 500)