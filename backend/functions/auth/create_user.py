import json
import boto3
import os
import uuid
from datetime import datetime
from botocore.exceptions import ClientError
import logging

# Import our shared modules
import sys
sys.path.append('/opt/python')
sys.path.append('../../shared')

from auth_middleware import require_auth, log_financial_activity
from response_utils import create_response, handle_error

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ['USERS_TABLE'])

@require_auth
def handler(event, context):
    """
    Create or update user profile after Cognito authentication
    """
    try:
        # Get user info from authentication middleware
        user_info = event['user']
        cognito_id = user_info['cognito_id']
        
        # Parse request body
        body = json.loads(event['body']) if event.get('body') else {}
        
        # Extract user data
        email = user_info.get('email') or body.get('email')
        given_name = user_info.get('given_name') or body.get('given_name')
        family_name = user_info.get('family_name') or body.get('family_name')
        
        if not email:
            return create_response(400, {'error': 'Email is required'})
        
        # Check if user already exists
        try:
            existing_user = users_table.get_item(Key={'cognitoId': cognito_id})
            if 'Item' in existing_user:
                return create_response(200, {
                    'message': 'User already exists',
                    'user': existing_user['Item']
                })
        except ClientError as e:
            logger.warning(f"Error checking existing user: {e}")
        
        # Create new user profile
        user_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        user_data = {
            'cognitoId': cognito_id,
            'userId': user_id,
            'email': email,
            'givenName': given_name or '',
            'familyName': family_name or '',
            'createdAt': now,
            'updatedAt': now,
            'isActive': True,
            'preferences': {
                'currency': 'AUD',
                'timezone': 'Australia/Sydney',
                'theme': 'light',
                'notifications': {
                    'email': True,
                    'push': False,
                    'sms': False
                }
            },
            'portfolioSettings': {
                'defaultPortfolioName': f"{given_name or 'My'} Portfolio",
                'riskTolerance': 'moderate',
                'investmentGoals': []
            },
            'securitySettings': {
                'mfaEnabled': False,
                'loginNotifications': True,
                'sessionTimeout': 3600
            }
        }
        
        # Store user in DynamoDB
        users_table.put_item(Item=user_data)
        
        # Log activity for audit trail
        log_financial_activity(
            user_id=cognito_id,
            activity='USER_CREATED',
            details={
                'email': email,
                'ip_address': event.get('requestContext', {}).get('http', {}).get('sourceIp'),
                'user_agent': event.get('headers', {}).get('user-agent')
            }
        )
        
        logger.info(f"User created successfully: {cognito_id}")
        
        return create_response(201, {
            'message': 'User created successfully',
            'user': user_data
        })
        
    except json.JSONDecodeError:
        return handle_error("Invalid JSON in request body", 400)
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        return handle_error(f"Failed to create user: {str(e)}", 500)