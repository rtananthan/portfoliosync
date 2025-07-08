import json
import os
import logging
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
from response_utils import success_response, bad_request_response, not_found_response, internal_error_response

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Update an existing property
    """
    try:
        logger.info("Updating property")
        
        # Get property ID from path parameters
        path_params = event.get('pathParameters', {})
        property_id = path_params.get('propertyId')
        
        if not property_id:
            return bad_request_response("Property ID is required")
        
        # Parse request body
        if 'body' not in event:
            return bad_request_response("Request body is required")
        
        try:
            body = json.loads(event['body'])
        except json.JSONDecodeError:
            return bad_request_response("Invalid JSON in request body")
        
        # Get table name from environment
        table_name = os.environ.get('PROPERTIES_TABLE')
        if not table_name:
            logger.error("PROPERTIES_TABLE environment variable not set")
            return internal_error_response("Configuration error")
        
        # Check if property exists
        try:
            existing_property = db_client.get_item(table_name, {'id': property_id})
            if not existing_property:
                return not_found_response("Property not found")
        except Exception as e:
            logger.error(f"Error checking property existence: {str(e)}")
            return internal_error_response("Failed to check property")
        
        # Build update expression dynamically
        update_expression = "SET updatedAt = :updated_at"
        expression_values = {':updated_at': datetime.utcnow().isoformat()}
        expression_names = {}
        
        # Handle updatable fields
        updatable_fields = {
            'address': 'address',
            'propertyType': 'propertyType',
            'purchasePrice': 'purchasePrice',
            'purchaseDate': 'purchaseDate',
            'currentValue': 'currentValue',
            'bedrooms': 'bedrooms',
            'bathrooms': 'bathrooms',
            'carSpaces': 'carSpaces',
            'landSize': 'landSize',
            'floorArea': 'floorArea',
            'yearBuilt': 'yearBuilt',
            'councilArea': 'councilArea',
            'stampDuty': 'stampDuty',
            'legalFees': 'legalFees',
            'otherPurchaseCosts': 'otherPurchaseCosts',
            'weeklyRent': 'weeklyRent',
            'tenantName': 'tenantName',
            'leaseStartDate': 'leaseStartDate',
            'leaseEndDate': 'leaseEndDate',
            'bondAmount': 'bondAmount',
            'propertyManager': 'propertyManager',
            'managementFeePercentage': 'managementFeePercentage',
            'councilRates': 'councilRates',
            'waterRates': 'waterRates',
            'insurance': 'insurance',
            'propertyManagementFees': 'propertyManagementFees',
            'maintenanceRepairs': 'maintenanceRepairs',
            'strataFees': 'strataFees',
            'landTax': 'landTax',
            'valuationDate': 'valuationDate',
            'valuationMethod': 'valuationMethod'
        }
        
        # Get current values for recalculations
        purchase_price = existing_property.get('purchasePrice', 0)
        current_value = existing_property.get('currentValue', 0)
        stamp_duty = existing_property.get('stampDuty', 0)
        legal_fees = existing_property.get('legalFees', 0)
        other_purchase_costs = existing_property.get('otherPurchaseCosts', 0)
        weekly_rent = existing_property.get('weeklyRent', 0)
        council_rates = existing_property.get('councilRates', 0)
        water_rates = existing_property.get('waterRates', 0)
        insurance = existing_property.get('insurance', 0)
        property_management_fees = existing_property.get('propertyManagementFees', 0)
        maintenance_repairs = existing_property.get('maintenanceRepairs', 0)
        strata_fees = existing_property.get('strataFees', 0)
        land_tax = existing_property.get('landTax', 0)
        
        # Process updates
        for field, db_field in updatable_fields.items():
            if field in body:
                value = body[field]
                
                # Convert numeric fields to Decimal
                if field in ['purchasePrice', 'currentValue', 'landSize', 'floorArea', 
                           'stampDuty', 'legalFees', 'otherPurchaseCosts', 'weeklyRent',
                           'bondAmount', 'managementFeePercentage', 'councilRates', 
                           'waterRates', 'insurance', 'propertyManagementFees', 
                           'maintenanceRepairs', 'strataFees', 'landTax']:
                    if value is not None:
                        value = Decimal(str(value))
                        
                        # Update local variables for calculations
                        if field == 'purchasePrice':
                            purchase_price = value
                        elif field == 'currentValue':
                            current_value = value
                        elif field == 'stampDuty':
                            stamp_duty = value
                        elif field == 'legalFees':
                            legal_fees = value
                        elif field == 'otherPurchaseCosts':
                            other_purchase_costs = value
                        elif field == 'weeklyRent':
                            weekly_rent = value
                        elif field == 'councilRates':
                            council_rates = value
                        elif field == 'waterRates':
                            water_rates = value
                        elif field == 'insurance':
                            insurance = value
                        elif field == 'propertyManagementFees':
                            property_management_fees = value
                        elif field == 'maintenanceRepairs':
                            maintenance_repairs = value
                        elif field == 'strataFees':
                            strata_fees = value
                        elif field == 'landTax':
                            land_tax = value
                
                update_expression += f", {db_field} = :{field}"
                expression_values[f":{field}"] = value
        
        # Recalculate derived values
        total_purchase_costs = purchase_price + stamp_duty + legal_fees + other_purchase_costs
        annual_rental_income = (weekly_rent * 52) if weekly_rent else Decimal('0')
        total_annual_expenses = (council_rates + water_rates + insurance + 
                               property_management_fees + maintenance_repairs + 
                               strata_fees + land_tax)
        
        capital_growth = current_value - total_purchase_costs
        capital_growth_percentage = (capital_growth / total_purchase_costs * Decimal('100')) if total_purchase_costs > 0 else Decimal('0')
        gross_rental_yield = (annual_rental_income / current_value * Decimal('100')) if current_value > 0 else Decimal('0')
        net_rental_yield = ((annual_rental_income - total_annual_expenses) / current_value * Decimal('100')) if current_value > 0 else Decimal('0')
        annual_cash_flow = annual_rental_income - total_annual_expenses
        total_return = capital_growth + annual_cash_flow
        return_percentage = (total_return / total_purchase_costs * Decimal('100')) if total_purchase_costs > 0 else Decimal('0')
        
        # Update calculated fields
        calculated_updates = {
            'totalPurchaseCosts': total_purchase_costs,
            'annualRentalIncome': annual_rental_income,
            'totalAnnualExpenses': total_annual_expenses,
            'capitalGrowth': capital_growth,
            'capitalGrowthPercentage': capital_growth_percentage,
            'grossRentalYield': gross_rental_yield,
            'netRentalYield': net_rental_yield,
            'annualCashFlow': annual_cash_flow,
            'totalReturn': total_return,
            'returnPercentage': return_percentage
        }
        
        for field, value in calculated_updates.items():
            update_expression += f", {field} = :{field}"
            expression_values[f":{field}"] = value
        
        # Calculate days held if purchase date is updated
        if 'purchaseDate' in body:
            try:
                purchase_date = body['purchaseDate']
                purchase_dt = datetime.fromisoformat(purchase_date.replace('Z', '+00:00')).date()
                current_dt = date.today()
                days_held = (current_dt - purchase_dt).days
                update_expression += ", daysHeld = :days_held"
                expression_values[':days_held'] = days_held
            except:
                # If date parsing fails, keep existing value
                pass
        
        # Update the property
        try:
            updated_property = db_client.update_item(
                table_name=table_name,
                key={'id': property_id},
                update_expression=update_expression,
                expression_attribute_values=expression_values,
                expression_attribute_names=expression_names if expression_names else None
            )
        except Exception as e:
            logger.error(f"Error updating property: {str(e)}")
            return internal_error_response("Failed to update property")
        
        logger.info(f"Updated property {property_id}")
        
        return success_response({
            'property': updated_property,
            'message': 'Property updated successfully'
        })
        
    except ValueError as e:
        logger.error(f"Invalid data format: {str(e)}")
        return bad_request_response(f"Invalid data format: {str(e)}")
    except Exception as e:
        logger.error(f"Error updating property: {str(e)}")
        return internal_error_response("Failed to update property")