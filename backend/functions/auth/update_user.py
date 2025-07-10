import json
import boto3
import os
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
    Update user profile information
    """
    try:
        # Get user info from authentication middleware
        user_info = event['user']
        cognito_id = user_info['cognito_id']
        
        # Parse request body
        body = json.loads(event['body']) if event.get('body') else {}
        
        # Validate user exists
        existing_user = users_table.get_item(Key={'cognitoId': cognito_id})
        if 'Item' not in existing_user:
            return create_response(404, {'error': 'User not found'})
        
        # Prepare update data
        now = datetime.utcnow().isoformat()
        update_expression = "SET updatedAt = :updatedAt"
        expression_values = {':updatedAt': now}
        
        # Handle allowed updates
        allowed_updates = {
            'givenName': 'givenName',
            'familyName': 'familyName',
            'preferences': 'preferences',
            'portfolioSettings': 'portfolioSettings'
        }
        
        for field, dynamo_field in allowed_updates.items():
            if field in body:
                update_expression += f", {dynamo_field} = :{field}"
                expression_values[f':{field}'] = body[field]
        
        # Update user in DynamoDB
        response = users_table.update_item(
            Key={'cognitoId': cognito_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_values,
            ReturnValues='ALL_NEW'
        )
        
        updated_user = response['Attributes']
        
        # Log activity for audit trail
        log_financial_activity(
            user_id=cognito_id,
            activity='USER_UPDATED',
            details={
                'updated_fields': list(body.keys()),
                'ip_address': event.get('requestContext', {}).get('http', {}).get('sourceIp'),
                'user_agent': event.get('headers', {}).get('user-agent')
            }
        )
        
        # Remove sensitive information before returning
        updated_user.pop('securitySettings', None)
        
        logger.info(f"User updated successfully: {cognito_id}")
        
        return create_response(200, {
            'message': 'User updated successfully',
            'user': updated_user
        })
        
    except json.JSONDecodeError:
        return handle_error("Invalid JSON in request body", 400)
    except ClientError as e:
        logger.error(f"DynamoDB error: {e}")
        return handle_error("Database error", 500)
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        return handle_error(f"Failed to update user: {str(e)}", 500)