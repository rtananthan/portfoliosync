import json
import os
import logging
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
from market_data_service import market_data_service
from response_utils import success_response, bad_request_response, not_found_response, internal_error_response

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Update an existing ETF
    """
    try:
        logger.info("Updating ETF")
        
        # Get ETF ID from path parameters
        path_params = event.get('pathParameters', {})
        etf_id = path_params.get('etfId')
        
        if not etf_id:
            return bad_request_response("ETF ID is required")
        
        # Parse request body
        if 'body' not in event:
            return bad_request_response("Request body is required")
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return bad_request_response("Invalid JSON in request body")
        
        # Get table name from environment
        table_name = os.environ.get('ETFS_TABLE')
        if not table_name:
            logger.error("ETFS_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        # Check if ETF exists
        try:
            existing_etf = db_client.get_item(table_name, {'id': etf_id})
            if not existing_etf:
                return not_found_response("ETF not found")
        except Exception as e:
            logger.error(f"Error checking ETF existence: {str(e)}")
            return internal_error_response("Failed to check ETF")
        
        # Build update expression dynamically
        update_expression = "SET updatedAt = :updated_at"
        expression_values = {':updated_at': datetime.utcnow().isoformat()}
        expression_names = {}
        
        # Handle updatable fields
        updatable_fields = {
            'quantity': 'quantity',
            'purchasePrice': 'purchasePrice',
            'purchaseDate': 'purchaseDate',
            'purchaseFees': 'purchaseFees',
            'currentPrice': 'currentPrice',
            'name': '#name',  # Reserved keyword
            'currency': 'currency',
            'exchange': 'exchange',
            'expenseRatio': 'expenseRatio',
            'distributionFrequency': 'distributionFrequency',
            'lastDistributionAmount': 'lastDistributionAmount',
            'lastDistributionDate': 'lastDistributionDate',
            'category': 'category'
        }
        
        # Get current values for calculations
        quantity = existing_etf.get('quantity', 0)
        purchase_price = existing_etf.get('purchasePrice', 0)
        purchase_fees = existing_etf.get('purchaseFees', 0)
        current_price = existing_etf.get('currentPrice', 0)
        
        # Process updates
        for field, db_field in updatable_fields.items():
            if field in body:
                value = body[field]
                
                # Handle reserved keywords
                if field == 'name':
                    expression_names['#name'] = 'name'
                
                # Convert numeric fields to Decimal
                if field in ['quantity', 'purchasePrice', 'purchaseFees', 'currentPrice', 'expenseRatio', 'lastDistributionAmount']:
                    value = Decimal(str(value))
                    
                    # Update local variables for calculations
                    if field == 'quantity':
                        quantity = value
                    elif field == 'purchasePrice':
                        purchase_price = value
                    elif field == 'purchaseFees':
                        purchase_fees = value
                    elif field == 'currentPrice':
                        current_price = value
                
                update_expression += f", {db_field} = :{field}"
                expression_values[f":{field}"] = value
        
        # Check if we should refresh current price
        force_refresh = body.get('forceRefresh', False)
        if force_refresh or 'refreshPrice' in body:
            try:
                symbol = existing_etf.get('symbol')
                market_data = market_data_service.get_stock_price(symbol, force_refresh=force_refresh)
                if market_data and market_data.get('price'):
                    current_price = market_data['price']
                    update_expression += ", currentPrice = :current_price"
                    expression_values[':current_price'] = current_price
                    logger.info(f"Updated current price for {symbol}: {current_price}")
            except Exception as e:
                logger.warning(f"Could not refresh price: {str(e)}")
        
        # Recalculate P&L values
        total_cost_basis = (quantity * purchase_price) + purchase_fees
        total_value = quantity * current_price
        total_return = total_value - total_cost_basis
        return_percentage = (total_return / total_cost_basis * Decimal('100')) if total_cost_basis > 0 else Decimal('0')
        
        # Update calculated fields
        update_expression += ", totalCostBasis = :total_cost_basis"
        update_expression += ", totalValue = :total_value"
        update_expression += ", totalReturn = :total_return"
        update_expression += ", returnPercentage = :return_percentage"
        
        expression_values[':total_cost_basis'] = total_cost_basis
        expression_values[':total_value'] = total_value
        expression_values[':total_return'] = total_return
        expression_values[':return_percentage'] = return_percentage
        
        # Calculate annual expense cost if expense ratio is provided
        if 'expenseRatio' in body:
            expense_ratio = Decimal(str(body['expenseRatio']))
            if expense_ratio > 0:
                annual_expense_cost = (total_value * expense_ratio) / Decimal('100')
                update_expression += ", annualExpenseCost = :annual_expense_cost"
                expression_values[':annual_expense_cost'] = annual_expense_cost
        
        # Calculate days held if purchase date is updated
        if 'purchaseDate' in body:
            try:
                purchase_date = body['purchaseDate']
                from datetime import datetime, date
                purchase_dt = datetime.fromisoformat(purchase_date.replace('Z', '+00:00')).date()
                current_dt = date.today()
                days_held = (current_dt - purchase_dt).days
                update_expression += ", daysHeld = :days_held"
                expression_values[':days_held'] = days_held
            except:
                # If date parsing fails, keep existing value
                pass
        
        # Update the ETF
        try:
            updated_etf = db_client.update_item(
                table_name=table_name,
                key={'id': etf_id},
                update_expression=update_expression,
                expression_attribute_values=expression_values,
                expression_attribute_names=expression_names if expression_names else None
            )
        except Exception as e:
            logger.error(f"Error updating ETF: {str(e)}")
            return internal_error_response("Failed to update ETF")
        
        logger.info(f"Updated ETF {etf_id}")
        
        return success_response({
            'etf': updated_etf,
            'message': 'ETF updated successfully'
        })
        
    except ValueError as e:
        logger.error(f"Invalid data format: {str(e)}")
        return bad_request_response(f"Invalid data format: {str(e)}")
    except Exception as e:
        logger.error(f"Error updating ETF: {str(e)}")
        return internal_error_response("Failed to update ETF")