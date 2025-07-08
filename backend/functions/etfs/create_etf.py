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
from market_data_service import market_data_service
from response_utils import success_response, created_response, bad_request_response, internal_error_response

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Create a new ETF in a portfolio
    """
    try:
        logger.info("Creating new ETF")
        
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
        
        # Validate required fields
        required_fields = ['symbol', 'quantity', 'purchasePrice', 'purchaseDate']
        for field in required_fields:
            if field not in body:
                return bad_request_response(f"{field} is required")
        
        # Get table name from environment
        table_name = os.environ.get('ETFS_TABLE')
        if not table_name:
            logger.error("ETFS_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        # Extract and validate data
        symbol = body['symbol'].upper()
        quantity = Decimal(str(body['quantity']))
        purchase_price = Decimal(str(body['purchasePrice']))
        purchase_date = body['purchaseDate']
        purchase_fees = Decimal(str(body.get('purchaseFees', 0)))
        
        # Optional ETF-specific fields
        expense_ratio = Decimal(str(body.get('expenseRatio', 0))) if body.get('expenseRatio') else None
        distribution_frequency = body.get('distributionFrequency')
        last_distribution_amount = Decimal(str(body.get('lastDistributionAmount', 0))) if body.get('lastDistributionAmount') else None
        last_distribution_date = body.get('lastDistributionDate')
        category = body.get('category', '')
        currency = body.get('currency', 'USD')
        exchange = body.get('exchange', '')
        
        # Try to get current price from market data
        current_price = purchase_price  # Default fallback
        etf_name = body.get('name', symbol)  # Default to symbol if name not provided
        
        try:
            market_data = market_data_service.get_stock_price(symbol)
            if market_data and market_data.get('price'):
                current_price = market_data['price']
                logger.info(f"Got current price for {symbol}: {current_price}")
        except Exception as e:
            logger.warning(f"Could not fetch current price for {symbol}: {str(e)}")
        
        # Calculate enhanced P&L values
        total_cost_basis = (quantity * purchase_price) + purchase_fees
        total_value = quantity * current_price
        total_return = total_value - total_cost_basis
        return_percentage = (total_return / total_cost_basis * Decimal('100')) if total_cost_basis > 0 else Decimal('0')
        
        # Calculate annual expense cost if expense ratio provided
        annual_expense_cost = None
        if expense_ratio and expense_ratio > 0:
            annual_expense_cost = (total_value * expense_ratio) / Decimal('100')
        
        # Calculate days held
        days_held = 0
        try:
            from datetime import datetime, date
            purchase_dt = datetime.fromisoformat(purchase_date.replace('Z', '+00:00')).date()
            current_dt = date.today()
            days_held = (current_dt - purchase_dt).days
        except:
            days_held = 0
        
        # Create ETF item
        etf_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        etf = {
            'id': etf_id,
            'portfolioId': portfolio_id,
            'symbol': symbol,
            'name': etf_name,
            'quantity': quantity,
            'purchasePrice': purchase_price,
            'purchaseDate': purchase_date,
            'purchaseFees': purchase_fees,
            'averagePrice': purchase_price,  # For backward compatibility
            'currentPrice': current_price,
            'currency': currency,
            'exchange': exchange,
            'category': category,
            'totalCostBasis': total_cost_basis,
            'totalValue': total_value,
            'totalReturn': total_return,
            'returnPercentage': return_percentage,
            'daysHeld': days_held,
            'createdAt': now,
            'updatedAt': now
        }
        
        # Add ETF-specific fields if provided
        if expense_ratio is not None:
            etf['expenseRatio'] = expense_ratio
        if annual_expense_cost is not None:
            etf['annualExpenseCost'] = annual_expense_cost
        if distribution_frequency:
            etf['distributionFrequency'] = distribution_frequency
        if last_distribution_amount is not None:
            etf['lastDistributionAmount'] = last_distribution_amount
        if last_distribution_date:
            etf['lastDistributionDate'] = last_distribution_date
        
        # Save to DynamoDB
        db_client.put_item(table_name, etf)
        
        logger.info(f"Created ETF {symbol} with ID: {etf_id}")
        
        return created_response({
            'etf': etf,
            'message': 'ETF created successfully'
        })
        
    except ValueError as e:
        logger.error(f"Invalid data format: {str(e)}")
        return bad_request_response(f"Invalid data format: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating ETF: {str(e)}")
        return internal_error_response("Failed to create ETF")