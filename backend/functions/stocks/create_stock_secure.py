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
from auth_middleware import require_auth
from validation_middleware import validate_input

# Validation rules for stock creation
STOCK_VALIDATION_RULES = {
    'required': ['symbol', 'quantity', 'purchasePrice', 'purchaseDate'],
    'fields': {
        'symbol': {
            'type': 'stock_symbol'
        },
        'quantity': {
            'type': 'integer',
            'options': {'min_value': 1, 'max_value': 1000000}
        },
        'purchasePrice': {
            'type': 'decimal',
            'options': {'min_value': 0.01, 'max_value': 10000.0}
        },
        'purchaseDate': {
            'type': 'date'
        },
        'notes': {
            'type': 'string',
            'options': {'max_length': 500}
        }
    }
}

@require_auth
@validate_input(STOCK_VALIDATION_RULES)
def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Create a new stock holding with authentication and validation
    """
    try:
        logger.info("Creating new stock with security middleware")
        
        # Get user info from auth middleware
        user_info = event.get('user', {})
        user_id = user_info.get('cognito_id')
        
        # Get portfolio ID from path parameters
        path_params = event.get('pathParameters', {})
        portfolio_id = path_params.get('portfolioId')
        
        if not portfolio_id:
            return bad_request_response("Portfolio ID is required")
        
        # Get validated data from validation middleware
        validated_data = event.get('validated_data', {})
        
        # Create stock record
        stock_id = str(uuid.uuid4())
        current_time = datetime.utcnow().isoformat()
        
        stock_item = {
            'id': stock_id,
            'portfolioId': portfolio_id,
            'userId': user_id,  # Add user association for security
            'symbol': validated_data['symbol'],
            'quantity': validated_data['quantity'],
            'purchasePrice': validated_data['purchasePrice'],
            'purchaseDate': validated_data['purchaseDate'],
            'notes': validated_data.get('notes', ''),
            'createdAt': current_time,
            'updatedAt': current_time,
            'isActive': True
        }
        
        # Save to DynamoDB
        table_name = os.environ.get('STOCKS_TABLE')
        if not table_name:
            logger.error("STOCKS_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        try:
            db_client.put_item(
                TableName=table_name,
                Item=stock_item
            )
            
            logger.info(f"Stock created successfully: {stock_id} for user: {user_id}")
            
            return created_response({
                'stock': stock_item,
                'message': 'Stock created successfully'
            })
            
        except Exception as db_error:
            logger.error(f"Database error creating stock: {str(db_error)}")
            return internal_error_response("Failed to create stock")
        
    except Exception as e:
        logger.error(f"Unexpected error in create stock: {str(e)}")
        return internal_error_response("An unexpected error occurred")