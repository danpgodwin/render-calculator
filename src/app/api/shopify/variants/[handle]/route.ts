import { type NextRequest, NextResponse } from "next/server"

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

export async function GET(request: NextRequest, { params }: { params: { handle: string } }) {
  console.log("🎨 [Shopify Variants API] Starting request...")

  try {
    const { handle } = params
    console.log("🎨 [Shopify Variants API] Fetching variants for handle:", handle)

    // Log environment variables (safely)
    console.log("🔧 [Shopify Variants API] Environment check:", {
      hasDomain: !!SHOPIFY_DOMAIN,
      hasToken: !!SHOPIFY_STOREFRONT_TOKEN,
      domain: SHOPIFY_DOMAIN ? `${SHOPIFY_DOMAIN.substring(0, 10)}...` : "NOT_SET",
    })

    if (!SHOPIFY_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
      console.error("❌ [Shopify Variants API] Missing environment variables")
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

    const shopifyUrl = `https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`
    console.log("🌐 [Shopify Variants API] Making request to:", shopifyUrl)

    const response = await fetch(shopifyUrl, {
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

    console.log("📡 [Shopify Variants API] Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [Shopify Variants API] HTTP error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500),
      })
      throw new Error(`Shopify API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("✅ [Shopify Variants API] Response structure:", {
      hasData: !!data.data,
      hasProduct: !!data.data?.productByHandle,
      productTitle: data.data?.productByHandle?.title,
      variantCount: data.data?.productByHandle?.variants?.edges?.length || 0,
      hasErrors: !!data.errors,
    })

    if (data.errors) {
      console.error("❌ [Shopify Variants API] GraphQL errors:", data.errors)
      return NextResponse.json(
        {
          error: "GraphQL errors",
          details: data.errors,
        },
        { status: 400 },
      )
    }

    if (!data.data.productByHandle) {
      console.warn("⚠️ [Shopify Variants API] Product not found:", handle)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const product = data.data.productByHandle

    // Transform variants into color options
    const colorVariants = product.variants.edges
      .map(({ node }: any) => {
        const colorOption = node.selectedOptions.find(
          (option: any) => option.name.toLowerCase() === "color" || option.name.toLowerCase() === "colour",
        )

        if (!colorOption) {
          console.log(`   └─ Variant "${node.title}" has no color option`)
          return null
        }

        console.log(`   └─ Color variant: ${colorOption.value} - £${node.price.amount}`)

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

    console.log("🎨 [Shopify Variants API] Color variants found:", colorVariants.length)

    // Calculate price adjustments from base price
    const basePrice = colorVariants.length > 0 ? Math.min(...colorVariants.map((v: any) => v.price)) : 0
    const colorOptions = colorVariants.map((variant: any) => ({
      ...variant,
      price_adjustment: variant.price - basePrice,
    }))

    console.log("✅ [Shopify Variants API] Final color options:", {
      count: colorOptions.length,
      basePrice,
      priceRange:
        colorOptions.length > 0
          ? `£${Math.min(...colorOptions.map((c) => c.price))} - £${Math.max(...colorOptions.map((c) => c.price))}`
          : "No variants",
    })

    return NextResponse.json({
      product: {
        title: product.title,
        handle: product.handle,
      },
      colorVariants: colorOptions,
    })
  } catch (error) {
    console.error("💥 [Shopify Variants API] Unexpected error:", error)
    console.error("💥 [Shopify Variants API] Error stack:", error instanceof Error ? error.stack : "No stack")

    return NextResponse.json(
      {
        error: "Failed to fetch product variants",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
