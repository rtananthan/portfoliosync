import json
import boto3
import os
from botocore.exceptions import ClientError
import logging

# Import our shared modules
import sys
sys.path.append('/opt/python')
sys.path.append('../../shared')

from auth_middleware import require_auth
from response_utils import create_response, handle_error

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ['USERS_TABLE'])

@require_auth
def handler(event, context):
    """
    Get user profile information
    """
    try:
        # Get user info from authentication middleware
        user_info = event['user']
        cognito_id = user_info['cognito_id']
        
        # Get user from DynamoDB
        response = users_table.get_item(Key={'cognitoId': cognito_id})
        
        if 'Item' not in response:
            return create_response(404, {'error': 'User not found'})
        
        user_data = response['Item']
        
        # Remove sensitive information before returning
        user_data.pop('securitySettings', None)
        
        logger.info(f"User retrieved successfully: {cognito_id}")
        
        return create_response(200, {
            'user': user_data
        })
        
    except ClientError as e:
        logger.error(f"DynamoDB error: {e}")
        return handle_error("Database error", 500)
    except Exception as e:
        logger.error(f"Error retrieving user: {str(e)}")
        return handle_error(f"Failed to retrieve user: {str(e)}", 500)