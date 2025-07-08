import json
from typing import Dict, Any, Optional

def create_response(status_code: int, body: Dict[str, Any], 
                   headers: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """Create a standardized API Gateway response"""
    default_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    }
    
    if headers:
        default_headers.update(headers)
    
    return {
        'statusCode': status_code,
        'headers': default_headers,
        'body': json.dumps(body, default=str)
    }

def success_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a 200 success response"""
    return create_response(200, data)

def created_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a 201 created response"""
    return create_response(201, data)

def error_response(status_code: int, message: str, error_code: Optional[str] = None) -> Dict[str, Any]:
    """Create an error response"""
    body = {'error': message}
    if error_code:
        body['errorCode'] = error_code
    return create_response(status_code, body)

def bad_request_response(message: str = "Bad Request") -> Dict[str, Any]:
    """Create a 400 bad request response"""
    return error_response(400, message, "BAD_REQUEST")

def not_found_response(message: str = "Resource not found") -> Dict[str, Any]:
    """Create a 404 not found response"""
    return error_response(404, message, "NOT_FOUND")

def internal_error_response(message: str = "Internal server error") -> Dict[str, Any]:
    """Create a 500 internal server error response"""
    return error_response(500, message, "INTERNAL_ERROR")