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
from response_utils import success_response, internal_error_response

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Get all portfolios
    """
    try:
        logger.info("Getting all portfolios")
        
        # Get table name from environment
        table_name = os.environ.get('PORTFOLIOS_TABLE')
        if not table_name:
            logger.error("PORTFOLIOS_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        # Scan the portfolios table
        portfolios = db_client.scan_table(table_name)
        
        logger.info(f"Retrieved {len(portfolios)} portfolios")
        
        return success_response({
            'portfolios': portfolios,
            'count': len(portfolios)
        })
        
    except Exception as e:
        logger.error(f"Error getting portfolios: {str(e)}")
        return internal_error_response("Failed to retrieve portfolios")