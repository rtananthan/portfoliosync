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
from market_data_service import market_data_service
from response_utils import success_response, bad_request_response, internal_error_response

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Update current prices for stocks in a portfolio or specific stocks
    Can be called with:
    - portfolioId: Update all stocks in portfolio
    - symbols: Update specific symbols (comma-separated)
    """
    try:
        logger.info("Updating stock prices")
        
        # Get query parameters
        query_params = event.get('queryStringParameters') or {}
        portfolio_id = query_params.get('portfolioId')
        symbols_param = query_params.get('symbols')
        force_refresh = query_params.get('forceRefresh', '').lower() == 'true'
        
        # Get table name from environment
        table_name = os.environ.get('STOCKS_TABLE')
        if not table_name:
            logger.error("STOCKS_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        stocks_to_update = []
        
        if portfolio_id:
            # Get all stocks in the portfolio
            try:
                stocks_to_update = db_client.query_index(
                    table_name=table_name,
                    index_name='portfolioId-index',
                    key_condition='portfolioId = :portfolio_id',
                    expression_values={':portfolio_id': portfolio_id}
                )
            except Exception as e:
                logger.error(f"Error querying stocks for portfolio {portfolio_id}: {str(e)}")
                return internal_error_response("Failed to retrieve stocks")
                
        elif symbols_param:
            # Get specific stocks by symbols
            symbols = [s.strip().upper() for s in symbols_param.split(',')]
            try:
                # For now, we'll scan the table to find stocks by symbol
                # In production, you might want a symbol-based GSI for better performance
                all_stocks = db_client.scan_table(table_name)
                stocks_to_update = [stock for stock in all_stocks if stock.get('symbol', '').upper() in symbols]
            except Exception as e:
                logger.error(f"Error finding stocks by symbols: {str(e)}")
                return internal_error_response("Failed to retrieve stocks")
        else:
            return bad_request_response("Either portfolioId or symbols parameter is required")
        
        if not stocks_to_update:
            return success_response({
                'message': 'No stocks found to update',
                'updated_count': 0
            })
        
        # Extract unique symbols
        symbols_to_fetch = list(set([stock['symbol'] for stock in stocks_to_update]))
        logger.info(f"Fetching prices for symbols: {symbols_to_fetch}")
        
        # Get current market prices
        try:
            market_prices = market_data_service.get_multiple_prices(symbols_to_fetch, force_refresh=force_refresh)
        except Exception as e:
            logger.error(f"Error fetching market data: {str(e)}")
            return internal_error_response("Failed to fetch market data")
        
        # Update stocks with new prices
        updated_stocks = []
        update_count = 0
        
        for stock in stocks_to_update:
            symbol = stock['symbol']
            
            if symbol not in market_prices:
                logger.warning(f"No market data available for {symbol}")
                continue
            
            try:
                market_data = market_prices[symbol]
                new_price = market_data['price']
                
                # Recalculate stock values with new price
                quantity = Decimal(str(stock.get('quantity', 0)))
                purchase_price = Decimal(str(stock.get('purchasePrice', stock.get('averagePrice', 0))))
                purchase_fees = Decimal(str(stock.get('purchaseFees', 0)))
                
                # Calculate new values
                total_cost_basis = (quantity * purchase_price) + purchase_fees
                total_value = quantity * new_price
                total_return = total_value - total_cost_basis
                return_percentage = (total_return / total_cost_basis * Decimal('100')) if total_cost_basis > 0 else Decimal('0')
                
                # Calculate days held if purchase date available
                days_held = stock.get('daysHeld')
                purchase_date = stock.get('purchaseDate')
                if purchase_date:
                    try:
                        from datetime import datetime, date
                        purchase_dt = datetime.fromisoformat(purchase_date.replace('Z', '+00:00')).date()
                        current_dt = date.today()
                        days_held = (current_dt - purchase_dt).days
                    except:
                        pass
                
                # Prepare update data
                now = datetime.utcnow().isoformat()
                update_data = {
                    'currentPrice': new_price,
                    'totalValue': total_value,
                    'totalReturn': total_return,
                    'returnPercentage': return_percentage,
                    'updatedAt': now,
                    'lastPriceUpdate': now,
                    'priceSource': market_data['source']
                }
                
                if days_held is not None:
                    update_data['daysHeld'] = days_held
                
                # Build update expression
                update_expressions = []
                expression_values = {}
                
                for key, value in update_data.items():
                    update_expressions.append(f"{key} = :{key}")
                    expression_values[f":{key}"] = value
                
                update_expression = "SET " + ", ".join(update_expressions)
                
                # Update the stock
                updated_stock = db_client.update_item(
                    table_name=table_name,
                    key={'id': stock['id']},
                    update_expression=update_expression,
                    expression_values=expression_values
                )
                
                updated_stocks.append({
                    'id': stock['id'],
                    'symbol': symbol,
                    'oldPrice': str(stock.get('currentPrice', 0)),
                    'newPrice': str(new_price),
                    'change': str(market_data.get('change', 0)),
                    'changePercent': str(market_data.get('change_percent', 0)),
                    'source': market_data['source'],
                    'cached': market_data.get('cached', False),
                    'ageHours': market_data.get('age_hours', 0)
                })
                
                update_count += 1
                
            except Exception as e:
                logger.error(f"Error updating stock {symbol}: {str(e)}")
                continue
        
        logger.info(f"Successfully updated prices for {update_count} stocks")
        
        return success_response({
            'message': f'Updated prices for {update_count} stocks',
            'updated_count': update_count,
            'updated_stocks': updated_stocks,
            'market_data_sources': list(set([stock['source'] for stock in updated_stocks]))
        })
        
    except Exception as e:
        logger.error(f"Error updating stock prices: {str(e)}")
        return internal_error_response("Failed to update stock prices")