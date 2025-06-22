# Vercel Deployment Guide

## 🚀 One-Click Deployment

The easiest way to deploy your Render Calculator is using Vercel's Git integration.

### Step 1: Push to Git

\`\`\`bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/render-calculator.git
git push -u origin main
\`\`\`

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect Next.js and configure build settings
5. Click "Deploy"

## ⚙️ Build Configuration

Vercel automatically detects these settings:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

## 🔧 Environment Variables

### For Shopify Integration (Optional)

In your Vercel dashboard → Settings → Environment Variables:

\`\`\`
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_xxxxx
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx
\`\`\`

### Getting Shopify API Keys

1. **Shopify Admin** → Apps → Develop apps
2. **Create private app**
3. **Storefront API:** Enable and copy token
4. **Admin API:** Enable required permissions and copy token

## 🌍 Custom Domain

### Add Custom Domain

1. **Vercel Dashboard** → Your Project → Settings → Domains
2. **Add Domain:** Enter your domain name
3. **Configure DNS:** Add CNAME record pointing to `cname.vercel-dns.com`
4. **SSL Certificate:** Automatically provisioned

### DNS Configuration

\`\`\`
Type: CNAME
Name: www (or @)
Value: cname.vercel-dns.com
\`\`\`

## 📊 Performance Monitoring

### Built-in Analytics

Vercel provides:
- **Real User Monitoring (RUM)**
- **Core Web Vitals tracking**
- **Function execution metrics**
- **Bandwidth usage**

### Add Vercel Analytics

\`\`\`bash
npm install @vercel/analytics @vercel/speed-insights
\`\`\`

Update `src/app/layout.tsx`:

\`\`\`typescript
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
\`\`\`

## 🔄 Automatic Deployments

### Git Integration Benefits

- **Automatic deployments** on every push to main branch
- **Preview deployments** for pull requests
- **Rollback capability** to previous deployments
- **Branch deployments** for testing

### Deployment Workflow

1. **Push to Git** → Triggers build
2. **Build Process** → Runs `npm run build`
3. **Deploy** → Goes live automatically
4. **Notifications** → Email/Slack notifications available

## 🛠️ Build Optimization

### Next.js Optimizations

Vercel automatically applies:
- **Static Site Generation (SSG)**
- **Incremental Static Regeneration (ISR)**
- **Image Optimization**
- **Code Splitting**
- **Tree Shaking**

### Performance Features

- **Edge Network** - Global CDN
- **Serverless Functions** - Auto-scaling
- **Edge Functions** - Ultra-low latency
- **Image Optimization** - WebP/AVIF conversion

## 🔍 Debugging Deployments

### Build Logs

1. **Vercel Dashboard** → Your Project → Deployments
2. **Click on deployment** → View build logs
3. **Function Logs** → Runtime logs available

### Common Issues

**Build Failures:**
\`\`\`bash
# Check Node.js version
"engines": {
  "node": ">=18.0.0"
}
\`\`\`

**Import Errors:**
\`\`\`bash
# Ensure all dependencies are in package.json
npm install --save missing-package
\`\`\`

**Environment Variables:**
\`\`\`bash
# Check variable names match exactly
SHOPIFY_STORE_DOMAIN (not SHOPIFY_DOMAIN)
\`\`\`

## 🚀 Advanced Configuration

### Vercel Configuration File

Create `vercel.json` for advanced settings:

\`\`\`json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
\`\`\`

### Edge Functions

For ultra-fast responses:

\`\`\`typescript
// src/app/api/edge-example/route.ts
export const runtime = 'edge'

export async function GET() {
  return new Response('Hello from Edge!')
}
\`\`\`

## 📈 Scaling

### Automatic Scaling

Vercel handles:
- **Traffic spikes** - Auto-scaling
- **Global distribution** - Edge network
- **Function scaling** - Serverless architecture

### Performance Monitoring

Monitor:
- **Response times**
- **Error rates** 
- **Function duration**
- **Bandwidth usage**

## 🔒 Security

### Built-in Security

- **HTTPS by default**
- **DDoS protection**
- **Bot protection**
- **Security headers**

### Additional Security

\`\`\`typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}
\`\`\`

## 💰 Pricing

### Hobby Plan (Free)
- **100GB bandwidth/month**
- **Unlimited static sites**
- **Serverless functions**
- **Custom domains**

### Pro Plan ($20/month)
- **1TB bandwidth/month**
- **Advanced analytics**
- **Password protection**
- **Team collaboration**

## 📞 Support

### Resources
- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation:** [nextjs.org/docs](https://nextjs.org/docs)
- **Community Support:** [github.com/vercel/vercel](https://github.com/vercel/vercel)

### Getting Help
1. **Check build logs** for specific errors
2. **Vercel Community** for common issues
3. **GitHub Issues** for bug reports
4. **Vercel Support** for Pro plan users

---

Your Render Calculator will be live and globally distributed within minutes! 🎉
