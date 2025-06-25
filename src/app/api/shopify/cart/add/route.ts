import { type NextRequest, NextResponse } from "next/server"

const SHOPIFY_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json()

    // Create a cart with the items
    const mutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const cartInput = {
      lines: items.map((item: any) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      })),
    }

    const response = await fetch(`https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN!,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input: cartInput },
      }),
    })

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.data.cartCreate.userErrors.length > 0) {
      return NextResponse.json({ error: data.data.cartCreate.userErrors }, { status: 400 })
    }

    return NextResponse.json({
      cart: data.data.cartCreate.cart,
    })
  } catch (error) {
    console.error("Shopify Cart API Error:", error)
    return NextResponse.json({ error: "Failed to add items to cart" }, { status: 500 })
  }
}
