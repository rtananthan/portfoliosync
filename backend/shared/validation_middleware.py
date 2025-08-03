import json
import os
import logging
from functools import wraps
from typing import Dict, Any, List, Optional, Union
import re
from decimal import Decimal, InvalidOperation

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

class ValidationMiddleware:
    def __init__(self):
        self.stage = os.environ.get('STAGE', 'dev')
        self.validation_level = os.environ.get('VALIDATION_LEVEL', 'loose' if self.stage == 'dev' else 'strict')
        self.is_strict = self.validation_level == 'strict'
        
    def validate_required_fields(self, data: Dict[str, Any], required_fields: List[str]) -> List[str]:
        """Validate that all required fields are present"""
        missing_fields = []
        for field in required_fields:
            if field not in data or data[field] is None or data[field] == '':
                missing_fields.append(field)
        return missing_fields
    
    def validate_string(self, value: Any, field_name: str, min_length: int = 1, max_length: int = 255, pattern: Optional[str] = None) -> str:
        """Validate string input"""
        if not isinstance(value, str):
            raise ValidationError(f"{field_name} must be a string")
        
        # Basic sanitization
        value = value.strip()
        
        if len(value) < min_length:
            raise ValidationError(f"{field_name} must be at least {min_length} characters")
        
        if len(value) > max_length:
            raise ValidationError(f"{field_name} must be no more than {max_length} characters")
        
        # Pattern validation (e.g., for stock symbols)
        if pattern and not re.match(pattern, value):
            raise ValidationError(f"{field_name} format is invalid")
        
        # Basic XSS prevention
        if self._contains_suspicious_content(value):
            if self.is_strict:
                raise ValidationError(f"{field_name} contains invalid characters")
            else:
                logger.warning(f"Suspicious content detected in {field_name}: {value}")
        
        return value
    
    def validate_decimal(self, value: Any, field_name: str, min_value: Optional[float] = None, max_value: Optional[float] = None) -> Decimal:
        """Validate decimal/currency input"""
        try:
            if isinstance(value, str):
                # Remove common currency symbols and whitespace
                value = re.sub(r'[$,\s]', '', value)
            
            decimal_value = Decimal(str(value))
            
            if min_value is not None and decimal_value < Decimal(str(min_value)):
                raise ValidationError(f"{field_name} must be at least {min_value}")
            
            if max_value is not None and decimal_value > Decimal(str(max_value)):
                raise ValidationError(f"{field_name} must be no more than {max_value}")
            
            return decimal_value
            
        except (InvalidOperation, ValueError):
            raise ValidationError(f"{field_name} must be a valid number")
    
    def validate_integer(self, value: Any, field_name: str, min_value: Optional[int] = None, max_value: Optional[int] = None) -> int:
        """Validate integer input"""
        try:
            int_value = int(value)
            
            if min_value is not None and int_value < min_value:
                raise ValidationError(f"{field_name} must be at least {min_value}")
            
            if max_value is not None and int_value > max_value:
                raise ValidationError(f"{field_name} must be no more than {max_value}")
            
            return int_value
            
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} must be a valid integer")
    
    def validate_date(self, value: Any, field_name: str) -> str:
        """Validate date string (YYYY-MM-DD format)"""
        if not isinstance(value, str):
            raise ValidationError(f"{field_name} must be a string")
        
        # Basic date format validation
        date_pattern = r'^\d{4}-\d{2}-\d{2}$'
        if not re.match(date_pattern, value):
            raise ValidationError(f"{field_name} must be in YYYY-MM-DD format")
        
        return value
    
    def validate_stock_symbol(self, symbol: str) -> str:
        """Validate stock symbol format"""
        # Australian stock symbols: 3-4 letters + .AX suffix
        # US symbols: 1-5 letters
        symbol = symbol.upper().strip()
        
        if re.match(r'^[A-Z]{1,5}$', symbol) or re.match(r'^[A-Z]{3,4}\.AX$', symbol):
            return symbol
        
        if self.is_strict:
            raise ValidationError("Invalid stock symbol format")
        else:
            logger.warning(f"Potentially invalid stock symbol: {symbol}")
            return symbol
    
    def _contains_suspicious_content(self, value: str) -> bool:
        """Check for basic XSS/injection patterns"""
        suspicious_patterns = [
            r'<script',
            r'javascript:',
            r'on\w+\s*=',
            r'<iframe',
            r'<object',
            r'<embed',
            r'SELECT.*FROM',
            r'INSERT.*INTO',
            r'DELETE.*FROM',
            r'DROP.*TABLE'
        ]
        
        value_lower = value.lower()
        for pattern in suspicious_patterns:
            if re.search(pattern, value_lower, re.IGNORECASE):
                return True
        
        return False
    
    def create_validation_response(self, errors: List[str]) -> Dict[str, Any]:
        """Create standardized validation error response"""
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            'body': json.dumps({
                'error': 'Validation failed',
                'details': errors,
                'validation_level': self.validation_level,
                'stage': self.stage
            })
        }

# Global instance
validation_middleware = ValidationMiddleware()

def validate_input(validation_rules: Dict[str, Any]):
    """Decorator to validate input data"""
    def decorator(f):
        @wraps(f)
        def decorated_function(event, context):
            try:
                # Parse request body
                if 'body' not in event or not event['body']:
                    if validation_middleware.is_strict:
                        return validation_middleware.create_validation_response(['Request body is required'])
                    else:
                        logger.warning("Missing request body - allowing in development mode")
                        return f(event, context)
                
                try:
                    body = json.loads(event['body'])
                except json.JSONDecodeError:
                    error_msg = 'Invalid JSON in request body'
                    if validation_middleware.is_strict:
                        return validation_middleware.create_validation_response([error_msg])
                    else:
                        logger.warning(f"{error_msg} - allowing in development mode")
                        return f(event, context)
                
                # Validate according to rules
                errors = []
                validated_data = {}
                
                # Check required fields
                if 'required' in validation_rules:
                    missing_fields = validation_middleware.validate_required_fields(body, validation_rules['required'])
                    if missing_fields:
                        errors.extend([f"Missing required field: {field}" for field in missing_fields])
                
                # Validate individual fields
                if 'fields' in validation_rules:
                    for field_name, field_rules in validation_rules['fields'].items():
                        if field_name in body:
                            try:
                                if field_rules['type'] == 'string':
                                    validated_data[field_name] = validation_middleware.validate_string(
                                        body[field_name], field_name, **field_rules.get('options', {})
                                    )
                                elif field_rules['type'] == 'decimal':
                                    validated_data[field_name] = validation_middleware.validate_decimal(
                                        body[field_name], field_name, **field_rules.get('options', {})
                                    )
                                elif field_rules['type'] == 'integer':
                                    validated_data[field_name] = validation_middleware.validate_integer(
                                        body[field_name], field_name, **field_rules.get('options', {})
                                    )
                                elif field_rules['type'] == 'date':
                                    validated_data[field_name] = validation_middleware.validate_date(
                                        body[field_name], field_name
                                    )
                                elif field_rules['type'] == 'stock_symbol':
                                    validated_data[field_name] = validation_middleware.validate_stock_symbol(
                                        body[field_name]
                                    )
                            except ValidationError as e:
                                errors.append(str(e))
                
                # Handle validation errors
                if errors:
                    if validation_middleware.is_strict:
                        return validation_middleware.create_validation_response(errors)
                    else:
                        logger.warning(f"Validation errors in development mode: {errors}")
                        # Continue with original data in loose mode
                        event['validated_data'] = body
                        return f(event, context)
                
                # Add validated data to event
                event['validated_data'] = validated_data if validated_data else body
                
                return f(event, context)
                
            except Exception as e:
                logger.error(f"Unexpected error in validation: {str(e)}")
                if validation_middleware.is_strict:
                    return validation_middleware.create_validation_response([f"Validation error: {str(e)}"])
                else:
                    logger.warning("Validation error in development mode - continuing")
                    return f(event, context)
        
        return decorated_function
    return decorator