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
    Delete a property from portfolio
    """
    try:
        logger.info("Deleting property")
        
        # Get property ID from path parameters
        path_params = event.get('pathParameters', {})
        property_id = path_params.get('propertyId')
        
        if not property_id:
            return bad_request_response("Property ID is required")
        
        # Get table name from environment
        table_name = os.environ.get('PROPERTIES_TABLE')
        if not table_name:
            logger.error("PROPERTIES_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        # Check if property exists before deletion
        try:
            existing_property = db_client.get_item(table_name, {'id': property_id})
            if not existing_property:
                return not_found_response("Property not found")
        except Exception as e:
            logger.error(f"Error checking property existence: {str(e)}")
            return internal_error_response("Failed to check property")
        
        # Delete the property
        try:
            db_client.delete_item(table_name, {'id': property_id})
            logger.info(f"Deleted property {property_id}")
            
            return success_response({
                'message': 'Property deleted successfully',
                'deletedId': property_id
            })
            
        except Exception as e:
            logger.error(f"Error deleting property: {str(e)}")
            return internal_error_response("Failed to delete property")
        
    except Exception as e:
        logger.error(f"Error deleting property: {str(e)}")
        return internal_error_response("Failed to delete property")