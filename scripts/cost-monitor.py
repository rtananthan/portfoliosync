#!/usr/bin/env python3
"""
Investment Tracker Cost Monitoring Script

This script helps monitor AWS costs for the Investment Tracker application
by querying AWS Cost Explorer API and generating cost reports.
"""

import boto3
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
import argparse

def get_cost_and_usage(start_date: str, end_date: str, cost_center: str) -> Dict[str, Any]:
    """
    Get cost and usage data from AWS Cost Explorer
    """
    client = boto3.client('ce', region_name='us-east-1')
    
    try:
        response = client.get_cost_and_usage(
            TimePeriod={
                'Start': start_date,
                'End': end_date
            },
            Granularity='DAILY',
            Metrics=['BlendedCost', 'UsageQuantity'],
            GroupBy=[
                {
                    'Type': 'DIMENSION',
                    'Key': 'SERVICE'
                },
                {
                    'Type': 'TAG',
                    'Key': 'CostCenter'
                }
            ],
            Filter={
                'Tags': {
                    'Key': 'CostCenter',
                    'Values': [cost_center]
                }
            }
        )
        return response
    except Exception as e:
        print(f"Error fetching cost data: {e}")
        return {}

def get_resource_costs(cost_center: str, days: int = 7) -> Dict[str, Any]:
    """
    Get detailed resource costs for the last N days
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    
    start_str = start_date.strftime('%Y-%m-%d')
    end_str = end_date.strftime('%Y-%m-%d')
    
    return get_cost_and_usage(start_str, end_str, cost_center)

def format_cost_report(cost_data: Dict[str, Any]) -> str:
    """
    Format cost data into a readable report
    """
    if not cost_data or 'ResultsByTime' not in cost_data:
        return "No cost data available"
    
    report = []
    report.append("=" * 60)
    report.append("INVESTMENT TRACKER - COST REPORT")
    report.append("=" * 60)
    
    total_cost = 0.0
    service_costs = {}
    
    for result in cost_data['ResultsByTime']:
        period = result['TimePeriod']
        report.append(f"\nPeriod: {period['Start']} to {period['End']}")
        
        for group in result.get('Groups', []):
            keys = group['Keys']
            amount = float(group['Metrics']['BlendedCost']['Amount'])
            
            if len(keys) >= 1:
                service = keys[0] if keys[0] else 'Unknown'
                service_costs[service] = service_costs.get(service, 0) + amount
                total_cost += amount
                
                if amount > 0:
                    report.append(f"  {service}: ${amount:.4f}")
    
    report.append("\n" + "=" * 60)
    report.append("SUMMARY BY SERVICE")
    report.append("=" * 60)
    
    for service, cost in sorted(service_costs.items(), key=lambda x: x[1], reverse=True):
        if cost > 0:
            percentage = (cost / total_cost * 100) if total_cost > 0 else 0
            report.append(f"{service:<30} ${cost:>8.4f} ({percentage:>5.1f}%)")
    
    report.append("-" * 60)
    report.append(f"{'TOTAL':<30} ${total_cost:>8.4f}")
    report.append("=" * 60)
    
    return "\n".join(report)

def get_budget_status(budget_name: str) -> Dict[str, Any]:
    """
    Get current budget status
    """
    client = boto3.client('budgets', region_name='us-east-1')
    
    try:
        response = client.describe_budget(
            BudgetName=budget_name
        )
        return response.get('Budget', {})
    except Exception as e:
        print(f"Error fetching budget data: {e}")
        return {}

def main():
    parser = argparse.ArgumentParser(description='Monitor Investment Tracker AWS costs')
    parser.add_argument('--cost-center', default='investment-tracker-dev', 
                       help='Cost center tag to filter by')
    parser.add_argument('--days', type=int, default=7, 
                       help='Number of days to analyze')
    parser.add_argument('--output', choices=['console', 'json'], default='console',
                       help='Output format')
    
    args = parser.parse_args()
    
    print(f"Fetching cost data for the last {args.days} days...")
    cost_data = get_resource_costs(args.cost_center, args.days)
    
    if args.output == 'json':
        print(json.dumps(cost_data, indent=2, default=str))
    else:
        report = format_cost_report(cost_data)
        print(report)
        
        # Add cost-saving recommendations
        print("\n" + "=" * 60)
        print("COST OPTIMIZATION RECOMMENDATIONS")
        print("=" * 60)
        print("1. Monitor Lambda execution duration and memory usage")
        print("2. Enable S3 Intelligent Tiering for long-term storage")
        print("3. Review DynamoDB read/write capacity if using provisioned mode")
        print("4. Use CloudFront caching to reduce origin requests")
        print("5. Set up auto-scaling for Lambda functions if needed")
        print("6. Consider using Lambda@Edge for global performance")
        print("7. Enable compression for CloudFront distribution")
        print("8. Monitor API Gateway request patterns and caching")

if __name__ == "__main__":
    main()