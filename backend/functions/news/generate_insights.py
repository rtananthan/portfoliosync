import json
import boto3
import os
from datetime import datetime
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

# Bedrock client (will be used when ready)
# bedrock_runtime = boto3.client('bedrock-runtime', region_name=os.environ.get('BEDROCK_REGION', 'us-east-1'))

def handler(event, context):
    """
    Generate AI-powered insights for news items using Bedrock
    """
    try:
        # Get symbol from path parameters
        symbol = event.get('pathParameters', {}).get('symbol')
        if not symbol:
            return handle_error("Symbol is required", 400)
        
        symbol = symbol.upper()
        
        logger.info(f"Generating insights for symbol: {symbol}")
        
        # Get pending news items for analysis
        pending_news = get_pending_news_items(symbol)
        
        if not pending_news:
            return create_response(200, {
                'symbol': symbol,
                'message': 'No pending news items for analysis',
                'processed': 0
            })
        
        # Process each news item
        processed_count = 0
        insights_generated = []
        
        for news_item in pending_news:
            try:
                insights = generate_ai_insights(news_item)
                update_news_with_insights(news_item['id'], insights)
                insights_generated.append({
                    'newsId': news_item['id'],
                    'headline': news_item.get('headline', ''),
                    'insights': insights
                })
                processed_count += 1
                
            except Exception as e:
                logger.error(f"Error processing news item {news_item.get('id')}: {str(e)}")
        
        logger.info(f"Generated insights for {processed_count} news items for {symbol}")
        
        return create_response(200, {
            'symbol': symbol,
            'message': f'Generated insights for {processed_count} news items',
            'processed': processed_count,
            'total': len(pending_news),
            'insights': insights_generated
        })
        
    except Exception as e:
        logger.error(f"Error generating insights: {str(e)}")
        return handle_error(f"Failed to generate insights: {str(e)}", 500)

def get_pending_news_items(symbol):
    """Get news items that need AI analysis"""
    try:
        # Query news items for symbol that haven't been analyzed yet
        response = news_table.query(
            IndexName='symbol-publishedAt-index',
            KeyConditionExpression=Key('symbol').eq(symbol),
            FilterExpression='attribute_exists(#status) AND #status = :status',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={':status': 'pending_analysis'},
            ScanIndexForward=False,  # Get newest first
            Limit=10  # Process in batches
        )
        
        return response.get('Items', [])
        
    except Exception as e:
        logger.error(f"Error getting pending news items: {str(e)}")
        return []

def generate_ai_insights(news_item):
    """
    Generate AI insights for a news item using Bedrock
    Currently returns mock data - will be replaced with actual Bedrock calls
    """
    try:
        symbol = news_item.get('symbol', '')
        headline = news_item.get('headline', '')
        summary = news_item.get('summary', '')
        
        logger.info(f"Generating AI insights for {symbol}: {headline[:50]}...")
        
        # TODO: Replace with actual Bedrock agent call
        # For now, return mock insights to test the infrastructure
        
        mock_insights = generate_mock_insights(symbol, headline, summary)
        
        logger.info(f"Generated insights: {mock_insights['recommendation']} with {mock_insights['confidence']}% confidence")
        
        return mock_insights
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {str(e)}")
        # Return default neutral insights on error
        return {
            'recommendation': 'HOLD',
            'confidence': 50,
            'sentiment': 'NEUTRAL',
            'keyPoints': ['Analysis pending due to processing error'],
            'priceTarget': None,
            'reasoning': 'Unable to complete analysis at this time'
        }

def generate_mock_insights(symbol, headline, summary):
    """
    Generate mock insights for testing
    TODO: Replace with actual Bedrock agent integration
    """
    import random
    
    # Analyze headline and summary for sentiment keywords
    positive_keywords = ['upgrade', 'strong', 'beat', 'growth', 'bullish', 'positive', 'outperform']
    negative_keywords = ['downgrade', 'weak', 'miss', 'decline', 'bearish', 'negative', 'underperform']
    
    text = (headline + ' ' + summary).lower()
    
    positive_score = sum(1 for word in positive_keywords if word in text)
    negative_score = sum(1 for word in negative_keywords if word in text)
    
    # Determine sentiment and recommendation
    if positive_score > negative_score:
        sentiment = 'POSITIVE'
        recommendation = 'BUY' if positive_score >= 2 else 'HOLD'
        confidence = min(75 + positive_score * 5, 95)
    elif negative_score > positive_score:
        sentiment = 'NEGATIVE'
        recommendation = 'SELL' if negative_score >= 2 else 'HOLD'
        confidence = min(75 + negative_score * 5, 95)
    else:
        sentiment = 'NEUTRAL'
        recommendation = 'HOLD'
        confidence = random.randint(60, 75)
    
    # Generate key points
    key_points = []
    if 'earnings' in text or 'quarter' in text:
        key_points.append('Quarterly earnings report shows financial performance trends')
    if 'analyst' in text:
        key_points.append('Analyst coverage provides market sentiment indicators')
    if 'upgrade' in text or 'downgrade' in text:
        key_points.append('Rating change reflects updated market outlook')
    if not key_points:
        key_points.append('Market news provides general investment context')
    
    # Add random insights for testing
    additional_insights = [
        'Technical indicators suggest continued momentum',
        'Market conditions remain favorable for sector',
        'Fundamental analysis supports current valuation',
        'Risk factors are within acceptable parameters'
    ]
    key_points.append(random.choice(additional_insights))
    
    return {
        'recommendation': recommendation,
        'confidence': confidence,
        'sentiment': sentiment,
        'keyPoints': key_points,
        'priceTarget': None,  # Could add random price target later
        'reasoning': f'Analysis based on {sentiment.lower()} sentiment indicators and market context',
        'analysisMethod': 'mock_bedrock_agent',
        'modelVersion': 'mock-v1.0'
    }

def update_news_with_insights(news_id, insights):
    """Update news item with generated insights"""
    try:
        # Update the news item with insights
        news_table.update_item(
            Key={'id': news_id},
            UpdateExpression='''SET 
                recommendation = :rec,
                confidence = :conf,
                sentiment = :sent,
                keyPoints = :points,
                priceTarget = :target,
                #status = :status,
                analyzedAt = :analyzed,
                insights = :insights
            ''',
            ExpressionAttributeNames={'#status': 'status'},
            ExpressionAttributeValues={
                ':rec': insights['recommendation'],
                ':conf': insights['confidence'],
                ':sent': insights['sentiment'],
                ':points': insights['keyPoints'],
                ':target': insights.get('priceTarget'),
                ':status': 'analyzed',
                ':analyzed': datetime.utcnow().isoformat(),
                ':insights': insights
            }
        )
        
        logger.info(f"Updated news item {news_id} with insights")
        
    except Exception as e:
        logger.error(f"Error updating news item with insights: {str(e)}")
        raise

# TODO: Implement actual Bedrock agent integration
def call_bedrock_agent_placeholder(symbol, headline, summary):
    """
    Placeholder for actual Bedrock agent call
    Will be implemented when Bedrock agent is set up
    """
    # This will be the actual implementation:
    # 
    # prompt = f'''
    # Analyze this financial news for investment insights:
    # 
    # Symbol: {symbol}
    # Headline: {headline}
    # Summary: {summary}
    # 
    # Provide:
    # 1. Investment recommendation (BUY/SELL/HOLD)
    # 2. Confidence level (0-100)
    # 3. Sentiment (POSITIVE/NEGATIVE/NEUTRAL)
    # 4. Key investment points
    # 5. Reasoning for recommendation
    # '''
    # 
    # response = bedrock_runtime.invoke_agent(
    #     agentId='your-agent-id',
    #     agentAliasId='your-alias-id',
    #     sessionId=str(uuid.uuid4()),
    #     inputText=prompt
    # )
    # 
    # return parse_bedrock_response(response)
    
    pass