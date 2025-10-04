#!/bin/bash

echo "🎯 Setting up MomentMatch AI..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for .env.local
if [ ! -f .env.local ]; then
    echo ""
    echo "⚠️  No .env.local file found."
    echo "📋 Creating .env.local from template..."
    cat > .env.local << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Twelve Labs API
TWELVE_LABS_API_KEY=your_twelve_labs_api_key_here

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo "✅ Created .env.local"
    echo ""
    echo "🔑 Please update .env.local with your actual API keys:"
    echo "   - Get Twelve Labs API key: https://twelvelabs.io"
    echo "   - Get OpenAI API key: https://platform.openai.com"
    echo "   - Set up NeonDB: https://neon.tech"
    echo ""
else
    echo "✅ .env.local already exists"
fi

# Set up database
echo ""
echo "🗄️  Setting up database..."
if [ -f .env.local ] && grep -q "DATABASE_URL=postgresql://" .env.local; then
    echo "Generating Drizzle migrations..."
    npx drizzle-kit generate
    
    echo "Pushing schema to database..."
    npx drizzle-kit push
    
    echo "✅ Database setup complete"
else
    echo "⚠️  Please configure DATABASE_URL in .env.local first"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then visit: http://localhost:3000"
echo ""

