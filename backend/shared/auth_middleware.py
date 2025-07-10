import json
import jwt
import os
import boto3
from functools import wraps
from typing import Dict, Any, Optional
import requests
from botocore.exceptions import ClientError
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class AuthenticationError(Exception):
    """Custom exception for authentication errors"""
    pass

class AuthMiddleware:
    def __init__(self):
        self.cognito_user_pool_id = os.environ.get('COGNITO_USER_POOL_ID')
        self.cognito_client_id = os.environ.get('COGNITO_CLIENT_ID')
        self.region = os.environ.get('REGION', 'ap-southeast-2')
        self.auth_enabled = os.environ.get('AUTH_ENABLED', 'true').lower() == 'true'
        self.jwt_secret = os.environ.get('JWT_SECRET', 'dev-secret-key-change-in-production')
        self.cognito_client = boto3.client('cognito-idp', region_name=self.region)
        
        # Cache for JWKs
        self._jwks_cache = None
        
    def get_jwks(self) -> Dict[str, Any]:
        """Get JSON Web Key Set from Cognito"""
        if self._jwks_cache is None:
            jwks_url = f"https://cognito-idp.{self.region}.amazonaws.com/{self.cognito_user_pool_id}/.well-known/jwks.json"
            response = requests.get(jwks_url)
            self._jwks_cache = response.json()
        return self._jwks_cache
    
    def verify_jwt_token(self, token: str) -> Dict[str, Any]:
        """Verify JWT token with Cognito"""
        try:
            # Decode header to get kid
            header = jwt.get_unverified_header(token)
            kid = header['kid']
            
            # Get the key from JWKS
            jwks = self.get_jwks()
            key = None
            for k in jwks['keys']:
                if k['kid'] == kid:
                    key = jwt.algorithms.RSAAlgorithm.from_jwk(k)
                    break
            
            if not key:
                raise AuthenticationError("Invalid token - key not found")
            
            # Verify token
            payload = jwt.decode(
                token,
                key,
                algorithms=['RS256'],
                audience=self.cognito_client_id,
                issuer=f"https://cognito-idp.{self.region}.amazonaws.com/{self.cognito_user_pool_id}"
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise AuthenticationError("Token has expired")
        except jwt.InvalidTokenError as e:
            raise AuthenticationError(f"Invalid token: {str(e)}")
        except Exception as e:
            raise AuthenticationError(f"Token verification failed: {str(e)}")
    
    def get_user_from_token(self, token: str) -> Dict[str, Any]:
        """Extract user information from JWT token"""
        try:
            payload = self.verify_jwt_token(token)
            return {
                'cognito_id': payload.get('sub'),
                'email': payload.get('email'),
                'given_name': payload.get('given_name'),
                'family_name': payload.get('family_name'),
                'token_use': payload.get('token_use'),
                'auth_time': payload.get('auth_time'),
                'exp': payload.get('exp')
            }
        except AuthenticationError:
            raise
        except Exception as e:
            raise AuthenticationError(f"Failed to extract user from token: {str(e)}")
    
    def authenticate_request(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Authenticate incoming request"""
        # Skip authentication in development if disabled
        if not self.auth_enabled:
            logger.info("Authentication disabled - allowing request")
            return {
                'cognito_id': 'dev-user-123',
                'email': 'dev@example.com',
                'given_name': 'Dev',
                'family_name': 'User'
            }
        
        # Get authorization header
        headers = event.get('headers', {})
        auth_header = headers.get('authorization') or headers.get('Authorization')
        
        if not auth_header:
            raise AuthenticationError("Missing authorization header")
        
        # Extract token from Bearer format
        if not auth_header.startswith('Bearer '):
            raise AuthenticationError("Invalid authorization header format")
        
        token = auth_header.split(' ')[1]
        
        # Verify and extract user info
        user_info = self.get_user_from_token(token)
        
        return user_info
    
    def create_auth_response(self, status_code: int, message: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Create standardized authentication response"""
        response_body = {
            'message': message,
            'timestamp': str(int(time.time())),
            'auth_enabled': self.auth_enabled
        }
        
        if data:
            response_body['data'] = data
        
        return {
            'statusCode': status_code,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            'body': json.dumps(response_body)
        }

# Global instance
auth_middleware = AuthMiddleware()

def require_auth(f):
    """Decorator to require authentication for Lambda functions"""
    @wraps(f)
    def decorated_function(event, context):
        try:
            # Authenticate request
            user_info = auth_middleware.authenticate_request(event)
            
            # Add user info to event
            event['user'] = user_info
            
            # Call original function
            return f(event, context)
            
        except AuthenticationError as e:
            logger.error(f"Authentication failed: {str(e)}")
            return auth_middleware.create_auth_response(401, str(e))
        except Exception as e:
            logger.error(f"Unexpected error in authentication: {str(e)}")
            return auth_middleware.create_auth_response(500, "Internal server error")
    
    return decorated_function

def optional_auth(f):
    """Decorator for optional authentication - adds user info if available"""
    @wraps(f)
    def decorated_function(event, context):
        try:
            # Try to authenticate but don't fail if not authenticated
            user_info = auth_middleware.authenticate_request(event)
            event['user'] = user_info
        except AuthenticationError:
            # No authentication - continue without user info
            event['user'] = None
        except Exception as e:
            logger.warning(f"Unexpected error in optional authentication: {str(e)}")
            event['user'] = None
        
        return f(event, context)
    
    return decorated_function

# Encryption utilities for sensitive data
import time
from cryptography.fernet import Fernet
import base64

class DataEncryption:
    def __init__(self):
        self.encryption_key = os.environ.get('ENCRYPTION_KEY', 'dev-encryption-key-32-chars-long')
        # Ensure key is 32 bytes for Fernet
        if len(self.encryption_key) != 32:
            self.encryption_key = self.encryption_key.ljust(32)[:32]
        self.fernet = Fernet(base64.urlsafe_b64encode(self.encryption_key.encode()))
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data like account numbers"""
        return self.fernet.encrypt(data.encode()).decode()
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        return self.fernet.decrypt(encrypted_data.encode()).decode()

# Global encryption instance
data_encryption = DataEncryption()

# Audit logging for financial compliance
def log_financial_activity(user_id: str, activity: str, details: Dict[str, Any]):
    """Log financial activities for audit trail"""
    audit_log = {
        'timestamp': str(int(time.time())),
        'user_id': user_id,
        'activity': activity,
        'details': details,
        'ip_address': details.get('ip_address'),
        'user_agent': details.get('user_agent')
    }
    
    logger.info(f"FINANCIAL_AUDIT: {json.dumps(audit_log)}")
    
    # In production, you might want to send this to CloudWatch Logs
    # or a specialized audit logging service