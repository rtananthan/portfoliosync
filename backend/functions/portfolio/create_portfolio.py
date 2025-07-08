import json
import os
import logging
import uuid
from datetime import datetime
from typing import Dict, Any
from decimal import Decimal

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Import shared utilities
import sys
sys.path.append('/opt/python')
sys.path.append(os.path.join(os.path.dirname(__file__), '../../shared'))

from dynamodb_client import db_client
from response_utils import success_response, created_response, bad_request_response, internal_error_response

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Create a new portfolio
    """
    try:
        logger.info("Creating new portfolio")
        
        # Parse request body
        if 'body' not in event:
            return bad_request_response("Request body is required")
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return bad_request_response("Invalid JSON in request body")
        
        # Validate required fields
        if 'name' not in body:
            return bad_request_response("Portfolio name is required")
        
        # Get table name from environment
        table_name = os.environ.get('PORTFOLIOS_TABLE')
        if not table_name:
            logger.error("PORTFOLIOS_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        # Create portfolio item
        portfolio_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        portfolio = {
            'id': portfolio_id,
            'name': body['name'],
            'description': body.get('description', ''),
            'totalValue': Decimal('0'),
            'totalReturn': Decimal('0'),
            'returnPercentage': Decimal('0'),
            'createdAt': now,
            'updatedAt': now
        }
        
        # Save to DynamoDB
        db_client.put_item(table_name, portfolio)
        
        logger.info(f"Created portfolio with ID: {portfolio_id}")
        
        return created_response({
            'portfolio': portfolio,
            'message': 'Portfolio created successfully'
        })
        
    except Exception as e:
        logger.error(f"Error creating portfolio: {str(e)}")
        return internal_error_response("Failed to create portfolio")