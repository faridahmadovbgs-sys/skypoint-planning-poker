@echo off
echo 🚀 Building SkyPoint for deployment...

REM Clean previous builds
if exist out rmdir /s /q out
if exist .next rmdir /s /q .next

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build for production
echo 🔨 Building production version...
npm run build

if %ERRORLEVEL% == 0 (
    echo ✅ Build successful!
    echo 📁 Static files are ready in the 'out/' directory
    echo.
    echo 🌐 Deployment options:
    echo 1. Upload 'out/' folder to any web host
    echo 2. Push to GitHub and deploy via Vercel/Netlify  
    echo 3. See DEPLOYMENT.md for detailed instructions
    echo.
    echo 🎉 SkyPoint is ready for the world!
) else (
    echo ❌ Build failed. Check the errors above.
    exit /b 1
)