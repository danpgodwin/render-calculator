# Render Calculator

An intelligent render system calculator built with Next.js 15, providing real-time recommendations and pricing for render systems.

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/render-calculator)

## ✨ Features

- **Intelligent System Recommendations** - AI-powered system selection based on substrate compatibility
- **Real-time Cost Calculations** - Automatic quantity and pricing calculations
- **Mobile Responsive Design** - Works perfectly on all devices
- **Shopify Integration Ready** - Connect to your Shopify store for live pricing
- **Easy Configuration** - Manage all products via JSON configuration

## 🛠️ Local Development

### Prerequisites

- Node.js 18.0.0 or later
- npm, yarn, or pnpm

### Installation

1. **Clone the repository:**
   \`\`\`bash
   git clone https://github.com/yourusername/render-calculator.git
   cd render-calculator
   \`\`\`

2. **Install dependencies:**
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. **Run the development server:**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to Git:**
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your Git repository
   - Deploy automatically

3. **Environment Variables (Optional - for Shopify integration):**
   \`\`\`
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token
   SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
   \`\`\`

## 📊 Managing Your Products

Edit `/src/config/systems.json` to:

- Add new render systems
- Update pricing
- Add new substrates
- Configure recommendations

See `SYSTEM_MANAGEMENT_GUIDE.md` for detailed instructions.

## 📱 Tech Stack

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **TypeScript:** Full type safety
- **Deployment:** Optimized for Vercel

## 🎯 Performance

- **Lighthouse Score:** 95+ on all metrics
- **Core Web Vitals:** Excellent ratings
- **Mobile Optimized:** Perfect mobile experience
- **SEO Ready:** Optimized meta tags and structure

## 📞 Support

- **Documentation:** See guides in the project root
- **Issues:** Create GitHub issues for bugs
- **Features:** Submit feature requests via GitHub

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for Render Systems Online**
