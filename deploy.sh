#!/bin/bash

echo "🚀 Building SkyPoint for deployment..."

# Clean previous builds
rm -rf out .next

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building production version..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Static files are ready in the 'out/' directory"
    echo ""
    echo "🌐 Deployment options:"
    echo "1. Upload 'out/' folder to any web host"
    echo "2. Push to GitHub and deploy via Vercel/Netlify"
    echo "3. See DEPLOYMENT.md for detailed instructions"
    echo ""
    echo "🎉 SkyPoint is ready for the world!"
else
    echo "❌ Build failed. Check the errors above."
    exit 1
fi