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
from response_utils import success_response, bad_request_response, not_found_response, internal_error_response

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Delete an ETF from portfolio
    """
    try:
        logger.info("Deleting ETF")
        
        # Get ETF ID from path parameters
        path_params = event.get('pathParameters', {})
        etf_id = path_params.get('etfId')
        
        if not etf_id:
            return bad_request_response("ETF ID is required")
        
        # Get table name from environment
        table_name = os.environ.get('ETFS_TABLE')
        if not table_name:
            logger.error("ETFS_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        # Check if ETF exists before deletion
        try:
            existing_etf = db_client.get_item(table_name, {'id': etf_id})
            if not existing_etf:
                return not_found_response("ETF not found")
        except Exception as e:
            logger.error(f"Error checking ETF existence: {str(e)}")
            return internal_error_response("Failed to check ETF")
        
        # Delete the ETF
        try:
            db_client.delete_item(table_name, {'id': etf_id})
            logger.info(f"Deleted ETF {etf_id}")
            
            return success_response({
                'message': 'ETF deleted successfully',
                'deletedId': etf_id
            })
            
        except Exception as e:
            logger.error(f"Error deleting ETF: {str(e)}")
            return internal_error_response("Failed to delete ETF")
        
    except Exception as e:
        logger.error(f"Error deleting ETF: {str(e)}")
        return internal_error_response("Failed to delete ETF")