import json
import os
import logging
from typing import Dict, Any

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Import shared utilities
import sys
sys.path.append('/opt/python')
sys.path.append(os.path.join(os.path.dirname(__file__), '../../shared'))

from dynamodb_client import db_client
from response_utils import success_response, bad_request_response, internal_error_response, not_found_response

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Delete a stock by ID
    """
    try:
        logger.info("Deleting stock")
        
        # Get stock ID from path parameters
        path_params = event.get('pathParameters', {})
        stock_id = path_params.get('stockId')
        
        if not stock_id:
            return bad_request_response("Stock ID is required")
        
        # Get table name from environment
        table_name = os.environ.get('STOCKS_TABLE')
        if not table_name:
            logger.error("STOCKS_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        # Check if stock exists first
        try:
            existing_stock = db_client.get_item(
                table_name=table_name,
                key={'id': stock_id}
            )
            
            if not existing_stock:
                return not_found_response("Stock not found")
                
        except Exception as e:
            logger.error(f"Error checking stock existence: {str(e)}")
            return internal_error_response("Failed to check stock")
        
        # Delete the stock
        try:
            db_client.delete_item(
                table_name=table_name,
                key={'id': stock_id}
            )
        except Exception as e:
            logger.error(f"Error deleting stock: {str(e)}")
            return internal_error_response("Failed to delete stock")
        
        logger.info(f"Successfully deleted stock {stock_id}")
        
        return success_response({
            'message': 'Stock deleted successfully',
            'stockId': stock_id
        })
        
    except Exception as e:
        logger.error(f"Error deleting stock: {str(e)}")
        return internal_error_response("Failed to delete stock")