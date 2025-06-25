import { type NextRequest, NextResponse } from "next/server"

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

export async function GET(request: NextRequest, { params }: { params: { handle: string } }) {
  console.log("🎨 [SHOPIFY VARIANTS] Starting variant fetch for handle:", params.handle)

  try {
    const { handle } = params

    if (!SHOPIFY_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
      console.error("🎨 [SHOPIFY VARIANTS] Missing environment variables")
      return NextResponse.json(
        {
          error: "Shopify configuration missing",
        },
        { status: 500 },
      )
    }

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

    console.log("🎨 [SHOPIFY VARIANTS] GraphQL query for handle:", handle)

    const shopifyUrl = `https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`
    const response = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables: { handle },
      }),
    })

    console.log("🎨 [SHOPIFY VARIANTS] Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("🎨 [SHOPIFY VARIANTS] HTTP Error:", {
        status: response.status,
        body: errorText.substring(0, 500),
      })
      throw new Error(`Shopify API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("🎨 [SHOPIFY VARIANTS] Raw response:", JSON.stringify(data, null, 2).substring(0, 500) + "...")

    if (!data.data.productByHandle) {
      console.log("🎨 [SHOPIFY VARIANTS] Product not found for handle:", handle)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = data.data.productByHandle
    console.log(
      "🎨 [SHOPIFY VARIANTS] Found product:",
      product.title,
      "with",
      product.variants.edges.length,
      "variants",
    )

    // Transform variants into color options
    const colorVariants = product.variants.edges
      .map(({ node }: any) => {
        const colorOption = node.selectedOptions.find(
          (option: any) => option.name.toLowerCase() === "color" || option.name.toLowerCase() === "colour",
        )

        if (!colorOption) {
          console.log("🎨 [SHOPIFY VARIANTS] No color option found for variant:", node.title)
          return null
        }

        console.log("🎨 [SHOPIFY VARIANTS] Found color variant:", colorOption.value, "price:", node.price.amount)

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

    console.log("🎨 [SHOPIFY VARIANTS] Processed color variants:", colorVariants.length)

    // Calculate price adjustments from base price
    const basePrice = colorVariants.length > 0 ? Math.min(...colorVariants.map((v: any) => v.price)) : 0
    const colorOptions = colorVariants.map((variant: any) => ({
      ...variant,
      price_adjustment: variant.price - basePrice,
    }))

    console.log("🎨 [SHOPIFY VARIANTS] Base price:", basePrice)
    console.log(
      "🎨 [SHOPIFY VARIANTS] Color options with adjustments:",
      colorOptions.map((c) => ({ name: c.name, adjustment: c.price_adjustment })),
    )

    return NextResponse.json({
      product: {
        title: product.title,
        handle: product.handle,
      },
      colorVariants: colorOptions,
    })
  } catch (error) {
    console.error("🎨 [SHOPIFY VARIANTS] Fatal error:", error)
    console.error("🎨 [SHOPIFY VARIANTS] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to fetch product variants",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
