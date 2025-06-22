# Installation Fix Guide

## 🚨 Latest Issues & Solutions

### Issue 1: Turbopack Configuration Deprecated
```
⚠ The config property `experimental.turbo` is deprecated. Move this setting to `config.turbopack`
```

**Solution:** ✅ Fixed in updated next.config.js

### Issue 2: Missing Tailwind PostCSS Plugin
```
Error: Cannot find module '@tailwindcss/postcss'
```

**Solution:** ✅ Fixed - Updated to use standard PostCSS configuration

### Issue 3: React Version Conflicts
```
npm warn ERESOLVE overriding peer dependency
```

**Solution:**
```bash
npm install --legacy-peer-deps
```

## 🛠️ Quick Setup Commands

### Option 1: Automated Setup (Recommended)

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```cmd
setup.bat
```

### Option 2: Manual Setup

```bash
# Clean install
rm -rf node_modules package-lock.json .next

# Install with legacy peer deps
npm install --legacy-peer-deps

# Test build
npm run build

# Start development
npm run dev
```

### Option 3: Alternative Package Managers

**Using Yarn (Often More Reliable):**
```bash
yarn install
yarn build
yarn dev
```

**Using pnpm:**
```bash
pnpm install
pnpm build
pnpm dev
```

## 🔧 Configuration Fixes Applied

### 1. Next.js Configuration
- ✅ Updated Turbopack configuration syntax
- ✅ Removed deprecated experimental.turbo
- ✅ Added proper Shopify image domains

### 2. PostCSS Configuration
- ✅ Replaced '@tailwindcss/postcss' with standard config
- ✅ Added autoprefixer support
- ✅ Compatible with Tailwind CSS v4

### 3. Package Dependencies
- ✅ Added missing postcss and autoprefixer
- ✅ Updated React to v19 (stable)
- ✅ Removed Turbopack flag from dev script

### 4. Tailwind Configuration
- ✅ Updated for Tailwind CSS v4 compatibility
- ✅ Proper CSS variable integration
- ✅ Simplified plugin configuration

## 🚀 Vercel Deployment (Bypass Local Issues)

If local setup continues to fail:

1. **Push to Git Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Import repository at [vercel.com](https://vercel.com)
   - Vercel handles build automatically
   - More robust than local development

3. **Environment Variables in Vercel:**
   ```
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token
   SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
   ```

## 📞 Troubleshooting Steps

### If Build Fails:
```bash
# Clear everything
rm -rf node_modules package-lock.json .next

# Try different Node version
nvm use 18  # or nvm use 20

# Force clean install
npm install --legacy-peer-deps --force

# Try without build
npm run dev
```

### If Development Server Fails:
```bash
# Try without Turbopack
npm run dev -- --no-turbo

# Or edit package.json dev script to:
"dev": "next dev --no-turbo"
```

### Check System Requirements:
- ✅ Node.js 18.0.0+ (recommended: 18.17.0 or 20.x)
- ✅ npm 8.0.0+ or yarn 1.22.0+
- ✅ Git for version control

## ✅ Success Indicators

When everything works:
```
✅ Installation successful!
✅ Build successful!
🎯 Ready to start development server
```

Then:
```bash
npm run dev
# Visit http://localhost:3000
```

## 🆘 Emergency Fallback

If nothing works locally:

1. **Use GitHub Codespaces** - Cloud development environment
2. **Deploy directly to Vercel** - Skip local development
3. **Use StackBlitz** - Online IDE with Node.js support

The calculator is designed to work perfectly in production environments even if local development has issues.

## 📋 Working Configuration Summary

**Package.json changes:**
- Removed `--turbopack` flag from dev script
- Added postcss and autoprefixer dependencies
- Updated to React 19

**Configuration files:**
- `next.config.js` - Fixed Turbopack syntax
- `postcss.config.mjs` - Standard PostCSS setup
- `tailwind.config.ts` - Tailwind v4 compatible

**Setup scripts:**
- `setup.sh` / `setup.bat` - Automated installation
- Handles cleaning, installation, and build testing

