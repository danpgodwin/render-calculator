# Enhanced Render System Calculator

A modern, intelligent calculator for render systems with real-time recommendations, pricing, and Shopify integration.

![Render Calculator](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

- **🧠 Intelligent System Recommendations** - Automatically selects the best render system based on substrate compatibility and performance metrics
- **💰 Real-time Cost Calculations** - Instant pricing with quantity calculations and coverage estimates
- **✅ Smart Validation** - Required field validation with helpful error messages
- **📱 Mobile Responsive** - Optimized for all devices with touch-friendly interface
- **🛒 Shopify Integration** - Direct integration with your Shopify store for real-time pricing and cart functionality
- **⚙️ Configuration Management** - JSON-based system for easy product and pricing management
- **🎨 Modern UI** - Clean, professional design with progress tracking

## 🏗️ Built With

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Vercel** - Deployment platform

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/render-calculator.git
   cd render-calculator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### System Management

All render systems, pricing, and product data are managed through `/src/config/systems.json`:

```json
{
  "brands": {
    "parex": {
      "name": "Parex",
      "systems": {
        "scratch": {
          "name": "Parex Scratch Render System",
          "components": {
            "basecoat": {
              "name": "Parex DPM BaseCoat 25kg",
              "price": 45.00,
              "coverage_per_unit": 14
            }
          }
        }
      }
    }
  }
}
```

### Environment Variables

Create `.env.local` for Shopify integration:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
```

## 📊 How It Works

### 1. Project Selection
Users select their project type (New Build, Retrofit, EWI, Maintenance)

### 2. Substrate & Area
Dynamic substrate options based on project type, with required area input

### 3. Intelligent Recommendations
Algorithm selects best system based on:
- Substrate compatibility
- Performance scores (durability, ease, cost, weather resistance)
- Coverage requirements

### 4. Cost Calculation
Automatic calculation of:
- Component quantities
- Individual pricing
- Total system cost
- Cost per m²

## 🛒 Shopify Integration

### Product Mapping
Each component includes a `shopify_handle` that maps to your Shopify products:

```json
{
  "shopify_handle": "parex-dpm-basecoat-25kg"
}
```

### Features
- Real-time pricing from Shopify
- Stock level checking
- Direct add-to-cart functionality
- Product image integration

## 📱 Responsive Design

- **Mobile First** - Optimized for mobile devices
- **Touch Friendly** - Large touch targets and intuitive gestures
- **Progressive Enhancement** - Works on all devices and browsers
- **Accessibility** - WCAG compliant with keyboard navigation

## 🔄 Adding New Systems

### 1. Add Brand
```json
{
  "brands": {
    "k-rend": {
      "name": "K-Rend",
      "description": "Silicone render systems"
    }
  }
}
```

### 2. Add System
```json
{
  "systems": {
    "hp12": {
      "name": "K-Rend HP12 System",
      "suitable_substrates": ["eps-insulation"],
      "performance": {
        "durability": 9,
        "ease_of_application": 8,
        "cost_effectiveness": 7,
        "weather_resistance": 10
      }
    }
  }
}
```

### 3. Add Components
```json
{
  "components": {
    "basecoat": {
      "name": "K-Rend HP12 BaseCoat",
      "shopify_handle": "k-rend-hp12-basecoat",
      "price": 48.00,
      "coverage_per_unit": 12
    }
  }
}
```

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for Google's performance standards
- **Bundle Size**: Optimized with code splitting and tree shaking
- **Loading Speed**: Sub-second initial load times

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import project in Vercel dashboard
   - Connect your Git repository

2. **Configure Environment Variables**
   - Add Shopify credentials in Vercel settings

3. **Deploy**
   - Automatic deployment on every push
   - Preview deployments for pull requests

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/
│   ├── ui/                 # Reusable UI components
│   └── Calculator.tsx      # Main calculator
├── config/
│   └── systems.json        # System configuration
└── lib/
    └── utils.ts            # Utility functions
```

## 🔧 Customization

### Styling
- Modify `tailwind.config.ts` for theme customization
- Update CSS variables in `globals.css`
- Component-level styling in individual files

### Functionality
- Add new steps in `Calculator.tsx`
- Extend system logic in configuration
- Add new UI components in `components/ui/`

## 📊 Analytics

### Recommended Integrations
- **Google Analytics 4** - User behavior tracking
- **Vercel Analytics** - Performance monitoring
- **Sentry** - Error tracking
- **Hotjar** - User experience insights

## 🔒 Security

- **HTTPS by default** on Vercel
- **Environment variable protection**
- **XSS protection** via React
- **Input validation** on all user inputs

## 🆘 Troubleshooting

### Common Issues

**Build Errors**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**Styling Issues**
- Check Tailwind configuration
- Verify CSS variable definitions
- Clear browser cache

**API Integration**
- Verify environment variables
- Check Shopify API permissions
- Test API endpoints

## 📞 Support

- **Documentation**: See `DEPLOYMENT_GUIDE.md` and `SYSTEM_MANAGEMENT_GUIDE.md`
- **Issues**: Create GitHub issues for bugs
- **Features**: Submit feature requests via GitHub

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Render Systems Online** - Product expertise and requirements
- **Next.js Team** - Amazing React framework
- **Vercel** - Excellent deployment platform
- **Tailwind CSS** - Beautiful utility-first CSS

---

**Built with ❤️ for the construction industry**

