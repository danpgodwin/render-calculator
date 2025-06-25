import { type NextRequest, NextResponse } from "next/server"

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  console.log("🛒 [Shopify Products API] Starting request...")

  try {
    // Log environment variables (safely)
    console.log("🔧 [Shopify Products API] Environment check:", {
      hasDomain: !!SHOPIFY_DOMAIN,
      hasToken: !!SHOPIFY_STOREFRONT_TOKEN,
      domain: SHOPIFY_DOMAIN ? `${SHOPIFY_DOMAIN.substring(0, 10)}...` : "NOT_SET",
      tokenLength: SHOPIFY_STOREFRONT_TOKEN?.length || 0,
    })

    if (!SHOPIFY_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
      console.error("❌ [Shopify Products API] Missing environment variables")
      return NextResponse.json(
        {
          error: "Shopify configuration missing",
          details: {
            hasDomain: !!SHOPIFY_DOMAIN,
            hasToken: !!SHOPIFY_STOREFRONT_TOKEN,
          },
        },
        { status: 500 },
      )
    }

    const { handles } = await request.json()
    console.log("📦 [Shopify Products API] Request payload:", { handles, count: handles?.length })

    if (!handles || !Array.isArray(handles)) {
      console.error("❌ [Shopify Products API] Invalid handles array:", handles)
      return NextResponse.json({ error: "Invalid handles array" }, { status: 400 })
    }

    // Build GraphQL query for multiple products with full variant details
    const handlesQuery = handles.map((handle) => `"${handle}"`).join(", ")
    console.log("🔍 [Shopify Products API] GraphQL query handles:", handlesQuery)

    const query = `
      query getProducts {
        products(first: 50, query: "handle:(${handlesQuery})") {
          edges {
            node {
              handle
              title
              productType
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
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
              images(first: 10) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    `

    const shopifyUrl = `https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`
    console.log("🌐 [Shopify Products API] Making request to:", shopifyUrl)

    const requestBody = JSON.stringify({ query })
    console.log("📝 [Shopify Products API] Request body length:", requestBody.length)

    const response = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN!,
      },
      body: requestBody,
    })

    console.log("📡 [Shopify Products API] Response status:", response.status)
    console.log("📡 [Shopify Products API] Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ [Shopify Products API] HTTP error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500) + (errorText.length > 500 ? "..." : ""),
      })
      throw new Error(`Shopify API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ [Shopify Products API] Raw response structure:", {
      hasData: !!data.data,
      hasProducts: !!data.data?.products,
      productCount: data.data?.products?.edges?.length || 0,
      hasErrors: !!data.errors,
      errors: data.errors,
    })

    if (data.errors) {
      console.error("❌ [Shopify Products API] GraphQL errors:", data.errors)
      return NextResponse.json(
        {
          error: "GraphQL errors",
          details: data.errors,
        },
        { status: 400 },
      )
    }

    // Transform the data into a more usable format
    const products: Record<string, any> = {}

    data.data.products.edges.forEach(({ node }: any) => {
      console.log(`🏷️ [Shopify Products API] Processing product: ${node.handle}`)

      const variants = node.variants.edges.map(({ node: variant }: any) => ({
        id: variant.id,
        title: variant.title,
        price: Number.parseFloat(variant.price.amount),
        availableForSale: variant.availableForSale,
        selectedOptions: variant.selectedOptions,
        image: variant.image,
      }))

      console.log(`   └─ Variants found: ${variants.length}`)

      // Check if this product has color variants
      const hasColorVariants = variants.some((variant: any) =>
        variant.selectedOptions.some(
          (option: any) => option.name.toLowerCase() === "color" || option.name.toLowerCase() === "colour",
        ),
      )

      // Get price range for products with variants
      const prices = variants.map((v: any) => v.price)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)

      console.log(`   └─ Price range: £${minPrice} - £${maxPrice}, hasColorVariants: ${hasColorVariants}`)

      products[node.handle] = {
        title: node.title,
        productType: node.productType,
        price: minPrice,
        maxPrice: maxPrice,
        hasColorVariants,
        showFromPrice: hasColorVariants && minPrice !== maxPrice,
        currency: node.priceRange.minVariantPrice.currencyCode,
        variants,
        images: node.images.edges.map(({ node: image }: any) => ({
          url: image.url,
          altText: image.altText,
        })),
      }
    })

    console.log("✅ [Shopify Products API] Final products:", {
      productHandles: Object.keys(products),
      totalProducts: Object.keys(products).length,
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error("💥 [Shopify Products API] Unexpected error:", error)
    console.error("💥 [Shopify Products API] Error stack:", error instanceof Error ? error.stack : "No stack")

    return NextResponse.json(
      {
        error: "Failed to fetch product prices",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
