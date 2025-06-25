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
                image {
                  url
                  altText
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
    const colorVariants = product.variants.edges
      .map(({ node }: any) => {
        const colorOption = node.selectedOptions.find(
          (option: any) => option.name.toLowerCase() === "color" || option.name.toLowerCase() === "colour",
        )

        if (!colorOption) return null

        return {
          id: node.id,
          name: colorOption.value,
          price: Number.parseFloat(node.price.amount),
          availableForSale: node.availableForSale,
          image: node.image,
          variantTitle: node.title,
        }
      })
      .filter(Boolean)

    // Calculate price adjustments from base price
    const basePrice = colorVariants.length > 0 ? Math.min(...colorVariants.map((v: any) => v.price)) : 0
    const colorOptions = colorVariants.map((variant: any) => ({
      ...variant,
      price_adjustment: variant.price - basePrice,
    }))

    return NextResponse.json({
      product: {
        title: product.title,
        handle: product.handle,
      },
      colorVariants: colorOptions,
    })
  } catch (error) {
    console.error("Shopify Variants API Error:", error)
    return NextResponse.json({ error: "Failed to fetch product variants" }, { status: 500 })
  }
}
