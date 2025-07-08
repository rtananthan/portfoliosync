#!/bin/bash

echo "🚀 Setting up Investment Tracker Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install AWS CLI first."
    exit 1
fi

# Check if Serverless Framework is installed
if ! command -v serverless &> /dev/null; then
    echo "📦 Installing Serverless Framework globally..."
    npm install -g serverless
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
# Install Python dependencies (optional - serverless will handle this during deployment)
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
else
    echo "Python pip3 not found - dependencies will be installed during deployment"
fi
cd ..

# Copy environment files
echo "🔧 Setting up environment files..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created root .env file"
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    echo "✅ Created frontend .env.local file"
fi

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend .env file"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure AWS credentials: aws configure"
echo "2. Update the .env files with your actual API keys (Alpha Vantage, Finnhub)"
echo "3. Deploy the backend: cd backend && npm run deploy"
echo "4. Update frontend/.env.local with the deployed API Gateway URL"
echo "5. Deploy frontend: cd frontend && npm run deploy"
echo ""
echo "For local development:"
echo "- Backend: cd backend && npm run offline (requires Python 3.11)"
echo "- Frontend: cd frontend && npm run dev"
echo ""
echo "Note: Backend is now in Python. Make sure you have Python 3.11 installed."