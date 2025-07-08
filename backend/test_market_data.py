#!/usr/bin/env python3

import os
import sys
sys.path.append('shared')

from market_data_service import market_data_service

def test_market_data():
    print("Testing market data APIs...")
    print(f"Alpha Vantage Key: {'SET' if os.environ.get('ALPHA_VANTAGE_API_KEY') else 'NOT SET'}")
    print(f"Finnhub Key: {'SET' if os.environ.get('FINNHUB_API_KEY') else 'NOT SET'}")
    
    # Test with a well-known symbol
    result = market_data_service.get_stock_price('AAPL')
    
    if result:
        print(f"✅ Success: {result}")
    else:
        print("❌ Failed to get market data")

if __name__ == "__main__":
    test_market_data()