# Render Calculator - Git & Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Create Git Repository

```bash
# Create new repository on GitHub/GitLab
# Clone to your local machine
git clone https://github.com/yourusername/render-calculator.git
cd render-calculator
```

### 2. Copy Project Files

Copy all files from the enhanced-render-calculator directory to your Git repository:

**Essential Files:**
```
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── progress.tsx
│   │   │   └── separator.tsx
│   │   └── Calculator.tsx
│   ├── config/
│   │   └── systems.json
│   └── lib/
│       └── utils.ts
├── package.json
├── package-lock.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── README.md
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Test Locally

```bash
npm run dev
```

Visit `http://localhost:3000` to test the calculator.

### 5. Deploy to Vercel

**Option A: Vercel CLI**
```bash
npm install -g vercel
vercel
```

**Option B: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Connect your Git repository
3. Deploy automatically

### 6. Environment Variables (For Shopify Integration)

In Vercel Dashboard → Settings → Environment Variables:

```
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
```

## 📁 Project Structure

```
render-calculator/
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── globals.css         # Global styles with CSS variables
│   │   ├── layout.tsx          # Root layout with metadata
│   │   └── page.tsx            # Main page component
│   ├── components/
│   │   ├── ui/                 # Reusable UI components
│   │   └── Calculator.tsx      # Main calculator component
│   ├── config/
│   │   └── systems.json        # All system data (YOU MANAGE THIS)
│   └── lib/
│       └── utils.ts            # Utility functions
├── package.json                # Dependencies and scripts
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── next.config.js             # Next.js configuration
```

## 🔧 Managing Your Systems

### Edit `/src/config/systems.json` to:

**Add New Brands:**
```json
{
  "brands": {
    "k-rend": {
      "name": "K-Rend",
      "description": "Silicone render systems",
      "systems": {
        "hp12": {
          "name": "K-Rend HP12 System",
          "components": {
            "basecoat": {
              "name": "K-Rend HP12 BaseCoat 25kg",
              "shopify_handle": "k-rend-hp12-basecoat-25kg",
              "price": 48.00,
              "coverage_per_unit": 12
            }
          }
        }
      }
    }
  }
}
```

**Update Pricing:**
```json
{
  "price": 52.00  // Just change the number
}
```

**Add New Substrates:**
```json
{
  "project_types": {
    "new-build": {
      "substrates": [
        {
          "id": "new-substrate-id",
          "name": "New Substrate Name",
          "description": "Description"
        }
      ]
    }
  }
}
```

## 🛒 Shopify Integration

### 1. Get API Credentials

**Storefront API (for product data):**
1. Shopify Admin → Apps → Develop apps
2. Create private app
3. Enable Storefront API
4. Copy Storefront access token

**Admin API (for cart operations):**
1. Same app → Admin API
2. Enable required permissions
3. Copy Admin API access token

### 2. Product Handles

Ensure `shopify_handle` in systems.json matches your Shopify product handles:

```json
{
  "shopify_handle": "parex-dpm-basecoat-25kg"
}
```

### 3. Test Integration

The calculator will automatically:
- Fetch real-time pricing from Shopify
- Add products to cart
- Check stock levels

## 📱 Features Included

### ✅ **Working Features:**
- **Intelligent System Recommendations** - Based on substrate compatibility
- **Real-time Cost Calculations** - Automatic quantity calculations
- **Required Field Validation** - Area input validation
- **Mobile Responsive Design** - Works on all devices
- **Progress Tracking** - 7-step process with progress bar
- **Configuration Management** - JSON-based system management

### 🔄 **Ready for Enhancement:**
- **Beading Selection** - Framework ready
- **Accessories Upselling** - Framework ready
- **Color Selection** - Framework ready
- **Shopify Cart Integration** - Environment variables ready

## 🚀 Performance Optimizations

### Built-in Optimizations:
- **Next.js 15** - Latest performance improvements
- **Turbopack** - Fast development builds
- **Static Generation** - Fast loading times
- **Image Optimization** - Automatic image optimization
- **Code Splitting** - Optimized bundle sizes

### Vercel Benefits:
- **Global CDN** - Fast worldwide access
- **Automatic HTTPS** - Secure by default
- **Zero Configuration** - Deploy with one click
- **Preview Deployments** - Test before going live

## 🔧 Customization

### Styling:
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Variables** - Easy theme customization
- **Responsive Design** - Mobile-first approach

### Functionality:
- **TypeScript** - Type-safe development
- **React 18** - Latest React features
- **Modern JavaScript** - ES2022+ features

## 📊 Analytics & Monitoring

### Recommended Additions:
```bash
# Google Analytics
npm install @next/third-parties

# Error Monitoring
npm install @sentry/nextjs

# Performance Monitoring
npm install @vercel/analytics
```

## 🔒 Security

### Built-in Security:
- **HTTPS by default** on Vercel
- **Environment variable protection**
- **XSS protection** via React
- **CSRF protection** via SameSite cookies

## 📈 Scaling

### When You Need More:
- **Database Integration** - Add PostgreSQL/MongoDB
- **User Authentication** - Add NextAuth.js
- **Payment Processing** - Integrate Stripe
- **Advanced Analytics** - Add custom tracking

## 🆘 Troubleshooting

### Common Issues:

**Build Errors:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**Styling Issues:**
```bash
# Rebuild Tailwind
npm run build
```

**Environment Variables:**
- Ensure no spaces around `=`
- Restart Vercel deployment after changes
- Check variable names match exactly

## 📞 Support

### Resources:
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **System Management Guide**: See SYSTEM_MANAGEMENT_GUIDE.md

### Quick Commands:
```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🎯 Next Steps After Deployment

1. **Test all functionality** on your live URL
2. **Add your product data** to systems.json
3. **Configure Shopify integration** with your API keys
4. **Customize styling** to match your brand
5. **Add Google Analytics** for tracking
6. **Set up monitoring** for errors and performance

Your calculator will be live and ready for customers! 🚀

