import json
import os
import logging
import uuid
from datetime import datetime, date
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
    Create a new property in a portfolio
    """
    try:
        logger.info("Creating new property")
        
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
        required_fields = ['address', 'propertyType', 'purchasePrice', 'purchaseDate', 'currentValue']
        for field in required_fields:
            if field not in body:
                return bad_request_response(f"{field} is required")
        
        # Get table name from environment
        table_name = os.environ.get('PROPERTIES_TABLE')
        if not table_name:
            logger.error("PROPERTIES_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        # Extract and validate data
        address = body['address']
        property_type = body['propertyType']
        purchase_price = Decimal(str(body['purchasePrice']))
        purchase_date = body['purchaseDate']
        current_value = Decimal(str(body['currentValue']))
        
        # Property details
        bedrooms = body.get('bedrooms')
        bathrooms = body.get('bathrooms')
        car_spaces = body.get('carSpaces')
        land_size = Decimal(str(body.get('landSize', 0))) if body.get('landSize') else None
        floor_area = Decimal(str(body.get('floorArea', 0))) if body.get('floorArea') else None
        year_built = body.get('yearBuilt')
        council_area = body.get('councilArea', '')
        
        # Purchase costs
        stamp_duty = Decimal(str(body.get('stampDuty', 0)))
        legal_fees = Decimal(str(body.get('legalFees', 0)))
        other_purchase_costs = Decimal(str(body.get('otherPurchaseCosts', 0)))
        total_purchase_costs = purchase_price + stamp_duty + legal_fees + other_purchase_costs
        
        # Rental information
        weekly_rent = Decimal(str(body.get('weeklyRent', 0))) if body.get('weeklyRent') else None
        annual_rental_income = (weekly_rent * 52) if weekly_rent else Decimal('0')
        tenant_name = body.get('tenantName', '')
        lease_start_date = body.get('leaseStartDate')
        lease_end_date = body.get('leaseEndDate')
        bond_amount = Decimal(str(body.get('bondAmount', 0))) if body.get('bondAmount') else None
        property_manager = body.get('propertyManager', '')
        management_fee_percentage = Decimal(str(body.get('managementFeePercentage', 0))) if body.get('managementFeePercentage') else None
        
        # Annual expenses
        council_rates = Decimal(str(body.get('councilRates', 0)))
        water_rates = Decimal(str(body.get('waterRates', 0)))
        insurance = Decimal(str(body.get('insurance', 0)))
        property_management_fees = Decimal(str(body.get('propertyManagementFees', 0)))
        maintenance_repairs = Decimal(str(body.get('maintenanceRepairs', 0)))
        strata_fees = Decimal(str(body.get('strataFees', 0)))
        land_tax = Decimal(str(body.get('landTax', 0)))
        total_annual_expenses = (council_rates + water_rates + insurance + 
                               property_management_fees + maintenance_repairs + 
                               strata_fees + land_tax)
        
        # Calculate derived fields
        capital_growth = current_value - total_purchase_costs
        capital_growth_percentage = (capital_growth / total_purchase_costs * Decimal('100')) if total_purchase_costs > 0 else Decimal('0')
        gross_rental_yield = (annual_rental_income / current_value * Decimal('100')) if current_value > 0 else Decimal('0')
        net_rental_yield = ((annual_rental_income - total_annual_expenses) / current_value * Decimal('100')) if current_value > 0 else Decimal('0')
        annual_cash_flow = annual_rental_income - total_annual_expenses
        total_return = capital_growth + annual_cash_flow
        return_percentage = (total_return / total_purchase_costs * Decimal('100')) if total_purchase_costs > 0 else Decimal('0')
        
        # Calculate days held
        days_held = 0
        try:
            purchase_dt = datetime.fromisoformat(purchase_date.replace('Z', '+00:00')).date()
            current_dt = date.today()
            days_held = (current_dt - purchase_dt).days
        except:
            days_held = 0
        
        # Valuation information
        valuation_date = body.get('valuationDate')
        valuation_method = body.get('valuationMethod', 'estimate')
        
        # Create property item
        property_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        property_item = {
            'id': property_id,
            'portfolioId': portfolio_id,
            'address': address,
            'propertyType': property_type,
            'purchasePrice': purchase_price,
            'purchaseDate': purchase_date,
            'currentValue': current_value,
            
            # Property details
            'bedrooms': bedrooms,
            'bathrooms': bathrooms,
            'carSpaces': car_spaces,
            'landSize': land_size,
            'floorArea': floor_area,
            'yearBuilt': year_built,
            'councilArea': council_area,
            
            # Purchase costs
            'stampDuty': stamp_duty,
            'legalFees': legal_fees,
            'otherPurchaseCosts': other_purchase_costs,
            'totalPurchaseCosts': total_purchase_costs,
            
            # Rental information
            'weeklyRent': weekly_rent,
            'annualRentalIncome': annual_rental_income,
            'tenantName': tenant_name,
            'leaseStartDate': lease_start_date,
            'leaseEndDate': lease_end_date,
            'bondAmount': bond_amount,
            'propertyManager': property_manager,
            'managementFeePercentage': management_fee_percentage,
            
            # Annual expenses
            'councilRates': council_rates,
            'waterRates': water_rates,
            'insurance': insurance,
            'propertyManagementFees': property_management_fees,
            'maintenanceRepairs': maintenance_repairs,
            'strataFees': strata_fees,
            'landTax': land_tax,
            'totalAnnualExpenses': total_annual_expenses,
            
            # Calculated fields
            'capitalGrowth': capital_growth,
            'capitalGrowthPercentage': capital_growth_percentage,
            'grossRentalYield': gross_rental_yield,
            'netRentalYield': net_rental_yield,
            'annualCashFlow': annual_cash_flow,
            'totalReturn': total_return,
            'returnPercentage': return_percentage,
            'daysHeld': days_held,
            
            # Valuation information
            'valuationDate': valuation_date,
            'valuationMethod': valuation_method,
            
            # Metadata
            'createdAt': now,
            'updatedAt': now
        }
        
        # Remove None values to avoid DynamoDB issues
        property_item = {k: v for k, v in property_item.items() if v is not None}
        
        # Save to DynamoDB
        db_client.put_item(table_name, property_item)
        
        logger.info(f"Created property {address} with ID: {property_id}")
        
        return created_response({
            'property': property_item,
            'message': 'Property created successfully'
        })
        
    except ValueError as e:
        logger.error(f"Invalid data format: {str(e)}")
        return bad_request_response(f"Invalid data format: {str(e)}")
    except Exception as e:
        logger.error(f"Error creating property: {str(e)}")
        return internal_error_response("Failed to create property")