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
from response_utils import success_response, bad_request_response, internal_error_response

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Get stocks for a specific portfolio
    """
    try:
        logger.info("Getting stocks for portfolio")
        
        # Get portfolio ID from path parameters
        path_params = event.get('pathParameters', {})
        portfolio_id = path_params.get('portfolioId')
        
        if not portfolio_id:
            return bad_request_response("Portfolio ID is required")
        
        # Get table name from environment
        table_name = os.environ.get('STOCKS_TABLE')
        if not table_name:
            logger.error("STOCKS_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        # Query stocks by portfolio ID using GSI
        try:
            stocks = db_client.query_index(
                table_name=table_name,
                index_name='portfolioId-index',
                key_condition='portfolioId = :portfolio_id',
                expression_values={':portfolio_id': portfolio_id}
            )
        except Exception as e:
            logger.error(f"Error querying stocks: {str(e)}")
            return internal_error_response("Failed to query stocks")
        
        logger.info(f"Retrieved {len(stocks)} stocks for portfolio {portfolio_id}")
        
        return success_response({
            'stocks': stocks,
            'portfolioId': portfolio_id,
            'count': len(stocks)
        })
        
    except Exception as e:
        logger.error(f"Error getting stocks: {str(e)}")
        return internal_error_response("Failed to retrieve stocks")