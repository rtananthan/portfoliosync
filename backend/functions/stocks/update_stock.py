import json
import os
import logging
from typing import Dict, Any
from decimal import Decimal
from datetime import datetime

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
    Update an existing stock
    """
    try:
        logger.info("Updating stock")
        
        # Get stock ID from path parameters
        path_params = event.get('pathParameters', {})
        stock_id = path_params.get('stockId')
        
        if not stock_id:
            return bad_request_response("Stock ID is required")
        
        # Parse request body
        try:
            body = json.loads(event.get('body', '{}'))
        except json.JSONDecodeError:
            return bad_request_response("Invalid JSON body")
        
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
        
        # Get current timestamp
        now = datetime.utcnow().isoformat()
        
        # Prepare update data (only update provided fields)
        update_data = {'updatedAt': now}
        
        # Update only provided fields with proper Decimal conversion
        if 'symbol' in body:
            update_data['symbol'] = body['symbol'].upper()
        if 'name' in body:
            update_data['name'] = body['name']
        if 'quantity' in body:
            update_data['quantity'] = Decimal(str(body['quantity']))
        if 'purchasePrice' in body:
            update_data['purchasePrice'] = Decimal(str(body['purchasePrice']))
        if 'purchaseDate' in body:
            update_data['purchaseDate'] = body['purchaseDate']
        if 'purchaseFees' in body:
            update_data['purchaseFees'] = Decimal(str(body['purchaseFees']))
        if 'averagePrice' in body:
            update_data['averagePrice'] = Decimal(str(body['averagePrice']))
        if 'currentPrice' in body:
            update_data['currentPrice'] = Decimal(str(body['currentPrice']))
        if 'currency' in body:
            update_data['currency'] = body['currency']
        if 'exchange' in body:
            update_data['exchange'] = body['exchange']
        if 'sector' in body:
            update_data['sector'] = body['sector']
        
        # Recalculate derived fields if relevant fields changed
        if any(field in body for field in ['quantity', 'purchasePrice', 'purchaseFees', 'currentPrice', 'averagePrice', 'purchaseDate']):
            # Get values from update_data or existing_stock
            quantity = update_data.get('quantity', existing_stock.get('quantity', Decimal('0')))
            purchase_price = update_data.get('purchasePrice', existing_stock.get('purchasePrice', existing_stock.get('averagePrice', Decimal('0'))))
            purchase_fees = update_data.get('purchaseFees', existing_stock.get('purchaseFees', Decimal('0')))
            current_price = update_data.get('currentPrice', existing_stock.get('currentPrice', purchase_price))
            purchase_date = update_data.get('purchaseDate', existing_stock.get('purchaseDate'))
            
            # Convert to Decimal if needed
            if not isinstance(quantity, Decimal):
                quantity = Decimal(str(quantity))
            if not isinstance(purchase_price, Decimal):
                purchase_price = Decimal(str(purchase_price))
            if not isinstance(purchase_fees, Decimal):
                purchase_fees = Decimal(str(purchase_fees))
            if not isinstance(current_price, Decimal):
                current_price = Decimal(str(current_price))
            
            # Calculate enhanced P&L values
            total_cost_basis = (quantity * purchase_price) + purchase_fees
            total_value = quantity * current_price
            total_return = total_value - total_cost_basis
            return_percentage = (total_return / total_cost_basis * Decimal('100')) if total_cost_basis > 0 else Decimal('0')
            
            # Calculate days held if purchase date available
            days_held = existing_stock.get('daysHeld')
            if purchase_date:
                try:
                    from datetime import date
                    purchase_dt = datetime.fromisoformat(purchase_date.replace('Z', '+00:00')).date()
                    current_dt = date.today()
                    days_held = (current_dt - purchase_dt).days
                except:
                    days_held = 0
            
            update_data.update({
                'totalCostBasis': total_cost_basis,
                'totalValue': total_value,
                'totalReturn': total_return,
                'returnPercentage': return_percentage,
                'daysHeld': days_held,
                'averagePrice': purchase_price  # For backward compatibility
            })
        
        # Build update expression and values with reserved keyword handling
        update_expressions = []
        expression_values = {}
        expression_names = {}
        
        # DynamoDB reserved keywords that need attribute name expressions
        reserved_keywords = {'name', 'size', 'status', 'date', 'timestamp'}
        
        for key, value in update_data.items():
            if key.lower() in reserved_keywords:
                # Use expression attribute name for reserved keywords
                attr_name = f"#{key}"
                expression_names[attr_name] = key
                update_expressions.append(f"{attr_name} = :{key}")
            else:
                update_expressions.append(f"{key} = :{key}")
            expression_values[f":{key}"] = value
        
        update_expression = "SET " + ", ".join(update_expressions)
        
        # Update the stock
        try:
            if expression_names:
                updated_stock = db_client.update_item(
                    table_name=table_name,
                    key={'id': stock_id},
                    update_expression=update_expression,
                    expression_values=expression_values,
                    expression_names=expression_names
                )
            else:
                updated_stock = db_client.update_item(
                    table_name=table_name,
                    key={'id': stock_id},
                    update_expression=update_expression,
                    expression_values=expression_values
                )
        except Exception as e:
            logger.error(f"Error updating stock: {str(e)}")
            return internal_error_response("Failed to update stock")
        
        logger.info(f"Successfully updated stock {stock_id}")
        
        return success_response({
            'stock': updated_stock
        })
        
    except Exception as e:
        logger.error(f"Error updating stock: {str(e)}")
        return internal_error_response("Failed to update stock")