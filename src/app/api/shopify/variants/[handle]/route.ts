import { type NextRequest, NextResponse } from "next/server"

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

export async function GET(request: NextRequest, { params }: { params: { handle: string } }) {
  try {
    const { handle } = params

    const query = `
      query getProductVariants($handle: String!) {
        productByHandle(handle: $handle) {
          title
          handle
          variants(first: 50) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    `

    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN!,
      },
      body: JSON.stringify({
        query,
        variables: { handle },
      }),
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.data.productByHandle) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = data.data.productByHandle

    // Transform variants into color options
    const colorVariants = product.variants.edges.map(({ node }: any) => {
      const colorOption = node.selectedOptions.find(
        (option: any) => option.name.toLowerCase() === "color" || option.name.toLowerCase() === "colour",
      )

      return {
        id: node.id,
        name: colorOption ? colorOption.value : node.title,
        price: Number.parseFloat(node.price.amount),
        availableForSale: node.availableForSale,
        // You can add hex color mapping here based on color names
        hex: getColorHex(colorOption ? colorOption.value : node.title),
      }
    })

    return NextResponse.json({
      product: {
        title: product.title,
        handle: product.handle,
      },
      colorVariants,
    })
  } catch (error) {
    console.error("Shopify Variants API Error:", error)
    return NextResponse.json({ error: "Failed to fetch product variants" }, { status: 500 })
  }
}

// Helper function to map color names to hex values
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    white: "#FFFFFF",
    "pure white": "#FFFFFF",
    cream: "#F5F5DC",
    "light grey": "#D3D3D3",
    "dark grey": "#696969",
    beige: "#F5F5DC",
    sandstone: "#FAD5A5",
    // Add more color mappings as needed
  }

  return colorMap[colorName.toLowerCase()] || "#CCCCCC"
}
