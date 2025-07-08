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
    Create a new stock holding
    """
    try:
        logger.info("Creating new stock")
        
        # Get portfolio ID from path parameters
        path_params = event.get('pathParameters', {})
        portfolio_id = path_params.get('portfolioId')
        
        if not portfolio_id:
            return bad_request_response("Portfolio ID is required")
        
        # Parse request body
        if 'body' not in event:
            return bad_request_response("Request body is required")
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return bad_request_response("Invalid JSON in request body")
        
        # Validate required fields (support both new and legacy formats)
        if 'purchasePrice' in body and 'purchaseDate' in body:
            # New enhanced format
            required_fields = ['symbol', 'quantity', 'purchasePrice', 'purchaseDate']
        else:
            # Legacy format for backward compatibility
            required_fields = ['symbol', 'quantity', 'averagePrice']
        
        for field in required_fields:
            if field not in body:
                return bad_request_response(f"{field} is required")
        
        # Validate data types and convert to Decimal
        try:
            quantity = Decimal(str(body['quantity']))
            
            # Handle both new and legacy formats
            if 'purchasePrice' in body:
                purchase_price = Decimal(str(body['purchasePrice']))
                purchase_fees = Decimal(str(body.get('purchaseFees', 0)))
                average_price = purchase_price  # For backward compatibility
            else:
                # Legacy format
                average_price = Decimal(str(body['averagePrice']))
                purchase_price = average_price
                purchase_fees = Decimal('0')
            
            current_price = Decimal(str(body.get('currentPrice', purchase_price)))
        except (ValueError, TypeError):
            return bad_request_response("Invalid numeric values")
        
        # Validate purchase date if provided
        purchase_date = body.get('purchaseDate')
        if purchase_date:
            try:
                from datetime import datetime
                datetime.fromisoformat(purchase_date.replace('Z', '+00:00'))
            except ValueError:
                return bad_request_response("Invalid date format. Use ISO format (YYYY-MM-DD)")
        
        # Get table name from environment
        table_name = os.environ.get('STOCKS_TABLE')
        if not table_name:
            logger.error("STOCKS_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        # Calculate values using enhanced P&L logic
        total_cost_basis = (quantity * purchase_price) + purchase_fees
        total_value = quantity * current_price
        total_return = total_value - total_cost_basis
        return_percentage = (total_return / total_cost_basis) * Decimal('100') if total_cost_basis > 0 else Decimal('0')
        
        # Calculate days held if purchase date provided
        days_held = None
        if purchase_date:
            try:
                from datetime import datetime, date
                purchase_dt = datetime.fromisoformat(purchase_date.replace('Z', '+00:00')).date()
                current_dt = date.today()
                days_held = (current_dt - purchase_dt).days
            except:
                days_held = 0
        
        # Create stock item
        stock_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        stock = {
            'id': stock_id,
            'portfolioId': portfolio_id,
            'symbol': body['symbol'].upper(),
            'name': body.get('name', body['symbol'].upper()),
            'quantity': quantity,
            'purchasePrice': purchase_price,
            'purchaseDate': purchase_date or now[:10],  # Use today if not provided
            'purchaseFees': purchase_fees,
            'averagePrice': average_price,  # For backward compatibility
            'currentPrice': current_price,
            'currency': body.get('currency', 'USD'),
            'exchange': body.get('exchange'),
            'sector': body.get('sector'),
            'totalCostBasis': total_cost_basis,
            'totalValue': total_value,
            'totalReturn': total_return,
            'returnPercentage': return_percentage,
            'daysHeld': days_held,
            'createdAt': now,
            'updatedAt': now
        }
        
        # Save to DynamoDB
        db_client.put_item(table_name, stock)
        
        logger.info(f"Created stock {body['symbol']} with ID: {stock_id}")
        
        return created_response({
            'stock': stock,
            'message': 'Stock created successfully'
        })
        
    except Exception as e:
        logger.error(f"Error creating stock: {str(e)}")
        return internal_error_response("Failed to create stock")