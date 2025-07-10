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
    Get news items for a specific symbol
    """
    try:
        # Get symbol from path parameters
        symbol = event.get('pathParameters', {}).get('symbol')
        if not symbol:
            return handle_error("Symbol is required", 400)
        
        symbol = symbol.upper()
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        limit = int(query_params.get('limit', '10'))
        days = int(query_params.get('days', '7'))
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        start_date_str = start_date.isoformat()
        
        logger.info(f"Fetching news for symbol: {symbol}, limit: {limit}, days: {days}")
        
        # Query news items for the symbol
        response = news_table.query(
            IndexName='symbol-publishedAt-index',
            KeyConditionExpression=Key('symbol').eq(symbol) & 
                                 Key('publishedAt').gte(start_date_str),
            ScanIndexForward=False,  # Sort by publishedAt descending (newest first)
            Limit=limit
        )
        
        news_items = response.get('Items', [])
        
        # Sort by publishedAt descending to ensure newest first
        news_items.sort(key=lambda x: x.get('publishedAt', ''), reverse=True)
        
        logger.info(f"Found {len(news_items)} news items for {symbol}")
        
        return create_response(200, {
            'symbol': symbol,
            'news': news_items,
            'count': len(news_items),
            'dateRange': {
                'from': start_date_str,
                'to': end_date.isoformat()
            }
        })
        
    except ValueError as e:
        return handle_error(f"Invalid parameter: {str(e)}", 400)
    except Exception as e:
        logger.error(f"Error fetching news: {str(e)}")
        return handle_error(f"Failed to fetch news: {str(e)}", 500)