@echo off
echo 🚀 Setting up Render Calculator...

REM Remove any existing node_modules and lock files
echo 📦 Cleaning previous installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .next rmdir /s /q .next

REM Install dependencies with legacy peer deps to handle React version conflicts
echo 📦 Installing dependencies...
npm install --legacy-peer-deps

REM Check if installation was successful
if %errorlevel% equ 0 (
    echo ✅ Installation successful!
    echo.
    echo 🔧 Building project...
    npm run build
    
    if %errorlevel% equ 0 (
        echo ✅ Build successful!
        echo.
        echo 🎯 Next steps:
        echo 1. Run 'npm run dev' to start development server
        echo 2. Open http://localhost:3000 in your browser
        echo 3. Edit src/config/systems.json to add your products
        echo.
        echo 📚 Documentation:
        echo - DEPLOYMENT_GUIDE.md - How to deploy to Vercel
        echo - SYSTEM_MANAGEMENT_GUIDE.md - How to manage products
        echo.
    ) else (
        echo ⚠️ Build failed, but you can still try development mode:
        echo npm run dev
    )
) else (
    echo ❌ Installation failed. Please try:
    echo npm install --legacy-peer-deps --force
    echo.
    echo Or use alternative package managers:
    echo yarn install
    echo pnpm install
)

pause

