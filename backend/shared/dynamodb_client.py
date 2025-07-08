import boto3
import os
from typing import Dict, Any, List, Optional

class DynamoDBClient:
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('REGION', 'us-east-1'))
        
    def get_table(self, table_name: str):
        return self.dynamodb.Table(table_name)
    
    def get_item(self, table_name: str, key: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        table = self.get_table(table_name)
        response = table.get_item(Key=key)
        return response.get('Item')
    
    def put_item(self, table_name: str, item: Dict[str, Any]) -> Dict[str, Any]:
        table = self.get_table(table_name)
        table.put_item(Item=item)
        return item
    
    def update_item(self, table_name: str, key: Dict[str, Any], 
                   update_expression: str, expression_values: Dict[str, Any],
                   expression_names: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        table = self.get_table(table_name)
        params = {
            'Key': key,
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_values,
            'ReturnValues': 'ALL_NEW'
        }
        
        # Add expression attribute names if provided
        if expression_names:
            params['ExpressionAttributeNames'] = expression_names
            
        response = table.update_item(**params)
        return response['Attributes']
    
    def delete_item(self, table_name: str, key: Dict[str, Any]) -> bool:
        table = self.get_table(table_name)
        table.delete_item(Key=key)
        return True
    
    def scan_table(self, table_name: str) -> List[Dict[str, Any]]:
        table = self.get_table(table_name)
        response = table.scan()
        return response.get('Items', [])
    
    def query_index(self, table_name: str, index_name: str, 
                   key_condition: str, expression_values: Dict[str, Any]) -> List[Dict[str, Any]]:
        table = self.get_table(table_name)
        response = table.query(
            IndexName=index_name,
            KeyConditionExpression=key_condition,
            ExpressionAttributeValues=expression_values
        )
        return response.get('Items', [])

# Singleton instance
db_client = DynamoDBClient()