import { type NextRequest, NextResponse } from "next/server"

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { handles } = await request.json()

    if (!handles || !Array.isArray(handles)) {
      return NextResponse.json({ error: "Invalid handles array" }, { status: 400 })
    }

    // Build GraphQL query for multiple products
    const handlesQuery = handles.map((handle) => `"${handle}"`).join(", ")

    const query = `
      query getProducts {
        products(first: 50, query: "handle:(${handlesQuery})") {
          edges {
            node {
              handle
              title
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                  }
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
      body: JSON.stringify({ query }),
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the data into a more usable format
    const products: Record<string, any> = {}

    data.data.products.edges.forEach(({ node }: any) => {
      products[node.handle] = {
        title: node.title,
        price: Number.parseFloat(node.priceRange.minVariantPrice.amount),
        currency: node.priceRange.minVariantPrice.currencyCode,
        variants: node.variants.edges.map(({ node: variant }: any) => ({
          id: variant.id,
          title: variant.title,
          price: Number.parseFloat(variant.price.amount),
          availableForSale: variant.availableForSale,
        })),
      }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Shopify API Error:", error)
    return NextResponse.json({ error: "Failed to fetch product prices" }, { status: 500 })
  }
}
