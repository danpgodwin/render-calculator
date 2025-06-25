import { type NextRequest, NextResponse } from "next/server"

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  console.log("🛒 [SHOPIFY API] Starting product fetch request")

  try {
    const { handles } = await request.json()
    console.log("🛒 [SHOPIFY API] Request payload:", { handles })

    if (!handles || !Array.isArray(handles)) {
      console.error("🛒 [SHOPIFY API] Invalid handles array:", handles)
      return NextResponse.json({ error: "Invalid handles array" }, { status: 400 })
    }

    // Check environment variables
    if (!SHOPIFY_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN) {
      console.error("🛒 [SHOPIFY API] Missing environment variables:", {
        hasDomain: !!SHOPIFY_DOMAIN,
        hasToken: !!SHOPIFY_STOREFRONT_TOKEN,
        domain: SHOPIFY_DOMAIN ? `${SHOPIFY_DOMAIN.substring(0, 10)}...` : "undefined",
      })
      return NextResponse.json(
        {
          error: "Shopify configuration missing. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN",
        },
        { status: 500 },
      )
    }

    console.log("🛒 [SHOPIFY API] Environment check passed:", {
      domain: `${SHOPIFY_DOMAIN.substring(0, 10)}...`,
      tokenLength: SHOPIFY_STOREFRONT_TOKEN.length,
    })

    // Build GraphQL query for multiple products with full variant details
    const handlesQuery = handles.map((handle) => `"${handle}"`).join(", ")
    console.log("🛒 [SHOPIFY API] Handles query:", handlesQuery)

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

    console.log("🛒 [SHOPIFY API] GraphQL Query:", query.substring(0, 200) + "...")

    const shopifyUrl = `https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`
    console.log("🛒 [SHOPIFY API] Making request to:", shopifyUrl)

    const response = await fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query }),
    })

    console.log("🛒 [SHOPIFY API] Response status:", response.status)
    console.log("🛒 [SHOPIFY API] Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("🛒 [SHOPIFY API] HTTP Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500),
      })
      throw new Error(`Shopify API HTTP error: ${response.status} - ${errorText.substring(0, 200)}`)
    }

    const data = await response.json()
    console.log("🛒 [SHOPIFY API] Raw response data:", JSON.stringify(data, null, 2).substring(0, 1000) + "...")

    // Check for GraphQL errors
    if (data.errors) {
      console.error("🛒 [SHOPIFY API] GraphQL Errors:", data.errors)
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(data.errors)}`)
    }

    if (!data.data || !data.data.products) {
      console.error("🛒 [SHOPIFY API] Invalid response structure:", data)
      throw new Error("Invalid response structure from Shopify")
    }

    console.log("🛒 [SHOPIFY API] Found products:", data.data.products.edges.length)

    // Transform the data into a more usable format
    const products: Record<string, any> = {}

    data.data.products.edges.forEach(({ node }: any, index: number) => {
      console.log(`🛒 [SHOPIFY API] Processing product ${index + 1}:`, {
        handle: node.handle,
        title: node.title,
        variantCount: node.variants.edges.length,
      })

      const variants = node.variants.edges.map(({ node: variant }: any) => ({
        id: variant.id,
        title: variant.title,
        price: Number.parseFloat(variant.price.amount),
        availableForSale: variant.availableForSale,
        selectedOptions: variant.selectedOptions,
        image: variant.image,
      }))

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

      const productData = {
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

      products[node.handle] = productData

      console.log(`🛒 [SHOPIFY API] Processed product ${node.handle}:`, {
        price: minPrice,
        maxPrice: maxPrice,
        hasColorVariants,
        showFromPrice: productData.showFromPrice,
      })
    })

    console.log("🛒 [SHOPIFY API] Final products object keys:", Object.keys(products))
    console.log("🛒 [SHOPIFY API] Request completed successfully")

    return NextResponse.json({ products })
  } catch (error) {
    console.error("🛒 [SHOPIFY API] Fatal error:", error)
    console.error("🛒 [SHOPIFY API] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to fetch product prices",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
