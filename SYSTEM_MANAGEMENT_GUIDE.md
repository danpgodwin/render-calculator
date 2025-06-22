# Render Calculator System Management Guide

## Overview

This guide explains how to manage and update the render calculator's systems, products, and calculations. The calculator is designed to be completely configurable through JSON files, allowing you to easily add new systems, update pricing, and modify recommendations without touching the code.

## Configuration File Structure

The main configuration is stored in `/src/config/systems.json`. This file contains all the data that drives the calculator:

### 1. Brands and Systems

\`\`\`json
{
  "brands": {
    "parex": {
      "name": "Parex",
      "description": "Premium render systems with proven performance",
      "systems": {
        "scratch": {
          "name": "Parex Scratch Render System",
          "description": "Traditional 3-coat system for maximum durability",
          "components": {
            "basecoat": {
              "name": "Parex DPM BaseCoat 25kg",
              "shopify_handle": "parex-dpm-basecoat-25kg",
              "price": 45.00,
              "coverage_per_unit": 14,
              "unit": "m²"
            }
          },
          "suitable_substrates": ["concrete-block", "clay-brick"],
          "performance": {
            "durability": 9,
            "ease_of_application": 7,
            "cost_effectiveness": 8,
            "weather_resistance": 9
          }
        }
      }
    }
  }
}
\`\`\`

### 2. Project Types and Substrates

\`\`\`json
{
  "project_types": {
    "new-build": {
      "name": "New Build",
      "description": "New construction project",
      "substrates": [
        {
          "id": "concrete-block",
          "name": "Concrete Block",
          "description": "Standard blockwork construction"
        }
      ]
    }
  }
}
\`\`\`

### 3. Beading Options

\`\`\`json
{
  "beading": {
    "scratch_render": [
      {
        "id": "sas-angle-15mm",
        "name": "SAS Angle Bead 15mm",
        "description": "Recommended for external corners",
        "price": 3.50,
        "length": 2.5,
        "recommended": true
      }
    ]
  }
}
\`\`\`

### 4. Accessories and Upselling

\`\`\`json
{
  "accessories": {
    "protection": [
      {
        "id": "masking-tape",
        "name": "Professional Masking Tape 50m",
        "price": 12.00,
        "bundle_discount": 0.15,
        "attachment_rate": 0.80
      }
    ]
  }
}
\`\`\`

## How to Add New Systems

### Step 1: Add a New Brand

\`\`\`json
{
  "brands": {
    "your-new-brand": {
      "name": "Your Brand Name",
      "description": "Brand description for customers",
      "systems": {
        // Add systems here
      }
    }
  }
}
\`\`\`

### Step 2: Add Systems to the Brand

\`\`\`json
{
  "systems": {
    "your-system-type": {
      "name": "Your System Name",
      "description": "System description",
      "components": {
        "basecoat": {
          "name": "Product Name",
          "shopify_handle": "shopify-product-handle",
          "price": 45.00,
          "coverage_per_unit": 14,
          "unit": "m²"
        },
        "mesh": {
          // Mesh component details
        },
        "topcoat": {
          // Topcoat component details
        }
      },
      "suitable_substrates": ["substrate-id-1", "substrate-id-2"],
      "performance": {
        "durability": 8,
        "ease_of_application": 9,
        "cost_effectiveness": 7,
        "weather_resistance": 8
      }
    }
  }
}
\`\`\`

## How the Recommendation Engine Works

The calculator automatically selects the best system based on:

1. **Substrate Compatibility**: Only systems that list the selected substrate in `suitable_substrates`
2. **Performance Score**: Sum of all performance metrics (durability + ease + cost + weather)
3. **Highest Score Wins**: The system with the highest total performance score is recommended

### Performance Scoring

Each system has four performance metrics (scale 1-10):
- **Durability**: How long the system lasts
- **Ease of Application**: How easy it is to apply
- **Cost Effectiveness**: Value for money
- **Weather Resistance**: Performance in harsh conditions

## How to Update Pricing

### Individual Product Pricing

Update the `price` field in any component:

\`\`\`json
{
  "basecoat": {
    "name": "Parex DPM BaseCoat 25kg",
    "price": 47.50,  // Updated price
    "coverage_per_unit": 14
  }
}
\`\`\`

### Bulk Price Updates

For bulk updates, you can:
1. Export the JSON file
2. Use find/replace in a text editor
3. Import back into the system

## How to Add New Project Types

\`\`\`json
{
  "project_types": {
    "your-new-type": {
      "name": "Display Name",
      "description": "Description for customers",
      "substrates": [
        {
          "id": "unique-substrate-id",
          "name": "Substrate Display Name",
          "description": "Substrate description"
        }
      ]
    }
  }
}
\`\`\`

## How to Add New Substrates

1. Add the substrate to the appropriate project type(s)
2. Add the substrate ID to relevant systems' `suitable_substrates` arrays

\`\`\`json
{
  "suitable_substrates": [
    "existing-substrate",
    "your-new-substrate-id"
  ]
}
\`\`\`

## How to Modify Beading Options

### For Scratch Render Systems

\`\`\`json
{
  "beading": {
    "scratch_render": [
      {
        "id": "unique-bead-id",
        "name": "Bead Display Name",
        "description": "When to use this bead",
        "price": 3.50,
        "length": 2.5,
        "recommended": true
      }
    ]
  }
}
\`\`\`

### For Thin Coat Systems

\`\`\`json
{
  "beading": {
    "thin_coat": [
      // Similar structure to scratch_render
    ]
  }
}
\`\`\`

## How to Update Accessories

### Adding New Accessories

\`\`\`json
{
  "accessories": {
    "your-category": [
      {
        "id": "unique-accessory-id",
        "name": "Accessory Display Name",
        "price": 25.00,
        "bundle_discount": 0.15,  // 15% discount when bundled
        "attachment_rate": 0.60,  // 60% of customers buy this
        "system_specific": ["scratch", "thin_coat"]  // Which systems this applies to
      }
    ]
  }
}
\`\`\`

### Accessory Categories

- **protection**: Masking tape, plastic sheeting, corner protection
- **tools**: Floats, paddles, buckets, trowels
- **performance**: Primers, bonding agents, additives
- **finishing**: Texture rollers, edge tools

## Shopify Integration

### Product Handles

Each component has a `shopify_handle` field that should match your Shopify product handle:

\`\`\`json
{
  "shopify_handle": "parex-dpm-basecoat-25kg"
}
\`\`\`

This allows the calculator to:
- Fetch real-time pricing from Shopify
- Add products directly to cart
- Check stock levels
- Display product images

### Setting Up Shopify Integration

1. Ensure all `shopify_handle` fields match your actual Shopify product handles
2. Set up environment variables for Shopify API access
3. The calculator will automatically use live data when available

## Coverage Calculations

The calculator automatically calculates quantities based on coverage:

\`\`\`json
{
  "coverage_per_unit": 14,  // m² covered per unit
  "unit": "m²"              // Unit of measurement
}
\`\`\`

**Formula**: `Quantity = Math.ceil(Area ÷ Coverage per Unit)`

## Testing New Configurations

1. Update the `systems.json` file
2. Restart the development server
3. Test the calculator with different project types and substrates
4. Verify recommendations are correct
5. Check pricing calculations

## Backup and Version Control

Always backup your `systems.json` file before making changes:

\`\`\`bash
cp src/config/systems.json src/config/systems.json.backup
\`\`\`

Consider using version control to track changes over time.

## Common Tasks

### Adding a New K-Rend System

\`\`\`json
{
  "brands": {
    "k-rend": {
      "name": "K-Rend",
      "description": "Silicone render systems",
      "systems": {
        "hp12": {
          "name": "K-Rend HP12 System",
          "description": "High-performance silicone render",
          "components": {
            "basecoat": {
              "name": "K-Rend HP12 BaseCoat 25kg",
              "shopify_handle": "k-rend-hp12-basecoat-25kg",
              "price": 48.00,
              "coverage_per_unit": 12,
              "unit": "m²"
            }
          },
          "suitable_substrates": ["eps-insulation", "mineral-wool"],
          "performance": {
            "durability": 9,
            "ease_of_application": 8,
            "cost_effectiveness": 7,
            "weather_resistance": 10
          }
        }
      }
    }
  }
}
\`\`\`

### Updating All Parex Prices by 5%

1. Search for `"price": ` in Parex sections
2. Multiply each price by 1.05
3. Round to 2 decimal places

### Adding a New Accessory Category

\`\`\`json
{
  "accessories": {
    "safety": [
      {
        "id": "safety-goggles",
        "name": "Safety Goggles",
        "price": 8.50,
        "bundle_discount": 0.10,
        "attachment_rate": 0.30,
        "system_specific": ["scratch", "thin_coat"]
      }
    ]
  }
}
\`\`\`

## Future Enhancements

The system is designed to be extensible. Future additions could include:

- Color-specific pricing
- Regional pricing variations
- Seasonal promotions
- Contractor discounts
- Bulk pricing tiers
- Alternative product suggestions

## Support

For technical support with the calculator system:
1. Check this guide first
2. Verify JSON syntax is valid
3. Test changes in development environment
4. Contact your development team for code-level changes

Remember: This system allows you to manage 90% of calculator changes without touching any code!
