"use client"

import { useState, useEffect } from "react"
import systemsConfig from "@/config/systems.json"

type PriceMap = Record<string, any>

const defaultPrices: PriceMap = {
  "product-a": { price: 10 },
  "product-b": { price: 20 },
  "product-c": { price: 30 },
}

const Calculator = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState({
    projectType: null as string | null,
    substrate: null as string | null,
    area: "",
    selectedSystem: null as any,
    beading: [] as any[],
    accessories: [] as any[],
    color: null as string | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableSystems, setAvailableSystems] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [shopifyPrices, setShopifyPrices] = useState<PriceMap>(defaultPrices)
  const [colorVariants, setColorVariants] = useState<any[]>([])

  const steps = [
    "Project Details",
    "Substrate & Area",
    "System Recommendations",
    "Select Beading",
    "Add Accessories",
    "Color Selection",
    "Review & Add to Cart",
  ]

  const progress = ((currentStep + 1) / steps.length) * 100

  useEffect(() => {
    // Replace with your actual Shopify product handles
    const handles = ["product-a", "product-b", "product-c"]
    fetchShopifyPrices(handles)
  }, [])

  // Enhanced Shopify price fetching with detailed logging
  const fetchShopifyPrices = async (handles: string[]) => {
    console.log("🛒 [Calculator] Starting fetchShopifyPrices with handles:", handles)

    try {
      if (!handles?.length) {
        console.warn("⚠️ [Calculator] No handles provided to fetchShopifyPrices")
        return
      }

      console.log("📡 [Calculator] Making fetch request to /api/shopify/products")

      const response = await fetch("/api/shopify/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ handles }),
      })

      console.log("📡 [Calculator] Response received:", {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
        ok: response.ok,
      })

      // Check content type first to avoid JSON parsing errors
      const contentType = response.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        console.error("❌ [Calculator] Response is not JSON:", {
          contentType,
          status: response.status,
        })

        // Try to get the actual response text for debugging
        const responseText = await response.text()
        console.error(
          "❌ [Calculator] Response body (first 500 chars):",
          responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""),
        )

        throw new Error(`API returned ${contentType} instead of JSON. Status: ${response.status}`)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ [Calculator] HTTP error response:", errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ [Calculator] Successfully parsed JSON response:", {
        hasProducts: !!data.products,
        productCount: data.products ? Object.keys(data.products).length : 0,
        productHandles: data.products ? Object.keys(data.products) : [],
      })

      if (data.products) {
        setShopifyPrices(data.products)
        console.log("✅ [Calculator] Updated shopifyPrices state")
      } else {
        console.warn("⚠️ [Calculator] No products in response")
      }
    } catch (error) {
      console.error("💥 [Calculator] Error in fetchShopifyPrices:", error)
      console.error("💥 [Calculator] Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack",
      })

      // Don't throw - let the app continue with fallback prices
      console.log("🔄 [Calculator] Continuing with fallback JSON prices")
    }
  }

  // Enhanced color variant fetching with logging
  const fetchColorVariants = async (handle: string) => {
    console.log("🎨 [Calculator] Starting fetchColorVariants for handle:", handle)

    try {
      console.log("📡 [Calculator] Making fetch request to /api/shopify/variants/" + handle)

      const response = await fetch(`/api/shopify/variants/${handle}`)

      console.log("📡 [Calculator] Color variants response:", {
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
        ok: response.ok,
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ [Calculator] Color variants error:", {
          status: response.status,
          body: errorText.substring(0, 200),
        })
        throw new Error("Failed to fetch color variants")
      }

      const data = await response.json()
      console.log("✅ [Calculator] Color variants data:", {
        productTitle: data.product?.title,
        variantCount: data.colorVariants?.length || 0,
        variants: data.colorVariants?.map((v: any) => ({ name: v.name, price: v.price })),
      })

      setColorVariants(data.colorVariants || [])
    } catch (error) {
      console.error("💥 [Calculator] Error fetching color variants:", error)

      // Fallback to default colors
      const defaultColors = [
        { id: "white", name: "Pure White", price_adjustment: 0, image: null },
        { id: "cream", name: "Cream", price_adjustment: 0, image: null },
        { id: "light-grey", name: "Light Grey", price_adjustment: 0, image: null },
      ]

      console.log("🔄 [Calculator] Using fallback colors:", defaultColors)
      setColorVariants(defaultColors)
    }
  }

  // Enhanced price function with logging
  const getPrice = (handle: string, variantId?: string) => {
    console.log(`💰 [Calculator] Getting price for handle: ${handle}, variantId: ${variantId}`)

    const shopifyProduct = shopifyPrices[handle]
    if (shopifyProduct?.price !== undefined) {
      console.log(`   └─ Found Shopify price: £${shopifyProduct.price}`)

      if (variantId && shopifyProduct.variants) {
        const variant = shopifyProduct.variants.find((v: any) => v.id === variantId)
        const price = variant?.price || shopifyProduct.price
        console.log(`   └─ Using variant price: £${price}`)
        return price
      }
      return shopifyProduct.price
    }

    // Fallback to JSON prices
    const brands = systemsConfig.brands as any
    for (const brand of Object.values(brands)) {
      for (const system of Object.values(brand.systems)) {
        for (const component of Object.values(system.components)) {
          if (component.shopify_handle === handle) {
            console.log(`   └─ Found JSON fallback price: £${component.price}`)
            return component.price
          }
        }
      }
    }

    console.warn(`   └─ No price found for handle: ${handle}, returning 0`)
    return 0
  }

  // Get display price with "from" prefix for color variants
  const getDisplayPrice = (handle: string) => {
    const shopifyProduct = shopifyPrices[handle]
    if (shopifyProduct?.showFromPrice) {
      return `from £${shopifyProduct.price.toFixed(2)}`
    }
    return `£${getPrice(handle).toFixed(2)}`
  }

  // Smart bundling for area-based accessories
  const calculateOptimalQuantity = (accessory: any, area: number) => {
    if (!accessory.area_based) {
      return { quantity: 1, totalPrice: accessory.price }
    }

    const shopifyProduct = shopifyPrices[accessory.shopify_handle]
    if (!shopifyProduct?.variants || shopifyProduct.variants.length <= 1) {
      // Single variant or no Shopify data - use simple calculation
      const quantity = Math.ceil(area / (accessory.coverage_per_unit || 1))
      return { quantity, totalPrice: quantity * accessory.price }
    }

    // Multiple variants - find optimal combination
    const variants = shopifyProduct.variants
      .map((v: any) => {
        // Extract size from variant title (e.g., "5kg", "25kg")
        const sizeMatch = v.title.match(/(\d+)kg/i)
        const coverage = sizeMatch
          ? Number.parseInt(sizeMatch[1]) * (accessory.coverage_per_unit / 25)
          : accessory.coverage_per_unit

        return {
          ...v,
          coverage,
          pricePerUnit: v.price / coverage,
        }
      })
      .sort((a: any, b: any) => a.pricePerUnit - b.pricePerUnit)

    // Simple greedy algorithm - use largest size first
    let remainingArea = area
    let totalCost = 0
    const quantities: any[] = []

    for (const variant of variants.reverse()) {
      if (remainingArea <= 0) break

      const quantity = Math.floor(remainingArea / variant.coverage)
      if (quantity > 0) {
        quantities.push({ variant, quantity })
        totalCost += quantity * variant.price
        remainingArea -= quantity * variant.coverage
      }
    }

    // Handle remaining area with smallest variant
    if (remainingArea > 0 && variants.length > 0) {
      const smallestVariant = variants[variants.length - 1]
      const additionalQuantity = Math.ceil(remainingArea / smallestVariant.coverage)

      const existingEntry = quantities.find((q) => q.variant.id === smallestVariant.id)
      if (existingEntry) {
        existingEntry.quantity += additionalQuantity
      } else {
        quantities.push({ variant: smallestVariant, quantity: additionalQuantity })
      }
      totalCost += additionalQuantity * smallestVariant.price
    }

    return {
      quantities,
      totalPrice: totalCost,
      breakdown: quantities.map((q) => `${q.quantity}x ${q.variant.title}`).join(", "),
    }
  }

  // Enhanced beading selection with size options
  const getBeadingVariant = (bead: any, selectedSize = "15mm") => {
    const shopifyProduct = shopifyPrices[bead.shopify_handle]
    if (!shopifyProduct?.variants) {
      return null
    }

    // Find variant matching the selected size
    const variant = shopifyProduct.variants.find((v: any) => v.title.toLowerCase().includes(selectedSize.toLowerCase()))

    return variant || shopifyProduct.variants[0]
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 0 && !selections.projectType) {
      newErrors.projectType = "Please select a project type"
    }

    if (step === 1) {
      if (!selections.substrate) {
        newErrors.substrate = "Please select a substrate type"
      }
      if (!selections.area || Number.parseFloat(selections.area) <= 0) {
        newErrors.area = "Please enter a valid area greater than 0"
      }
    }

    if (step === 2 && !selections.selectedSystem) {
      newErrors.selectedSystem = "Please select a system to proceed"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const findCompatibleSystems = (projectType: string, substrate: string) => {
    const brands = systemsConfig.brands as any
    const compatibleSystems: any[] = []

    Object.entries(brands).forEach(([brandKey, brand]: [string, any]) => {
      Object.entries(brand.systems).forEach(([systemKey, system]: [string, any]) => {
        if (system.suitable_substrates.includes(substrate)) {
          const score =
            system.performance.durability +
            system.performance.ease_of_application +
            system.performance.cost_effectiveness +
            system.performance.weather_resistance

          compatibleSystems.push({
            brandKey,
            brandName: brand.name,
            systemKey,
            systemData: system,
            score,
            isRecommended: false,
          })
        }
      })
    })

    compatibleSystems.sort((a, b) => b.score - a.score)
    if (compatibleSystems.length > 0) {
      compatibleSystems[0].isRecommended = true
    }

    return compatibleSystems
  }

  const calculateSystemCost = (systemData: any, area: string) => {
    console.log("💰 [Calculator] Calculating system cost for area:", area)

    const areaNum = Number.parseFloat(area)
    const components: any[] = []
    let totalCost = 0

    Object.entries(systemData.components).forEach(([componentKey, component]: [string, any]) => {
      const quantity = Math.ceil(areaNum / component.coverage_per_unit)
      const price = getPrice(component.shopify_handle)
      const totalPrice = quantity * price
      totalCost += totalPrice

      console.log(`   └─ ${componentKey}: ${quantity} × £${price} = £${totalPrice}`)

      components.push({
        ...component,
        quantity,
        price,
        totalPrice,
        componentType: componentKey,
        displayPrice: getDisplayPrice(component.shopify_handle),
      })
    })

    console.log(`✅ [Calculator] Total system cost: £${totalCost}`)
    return { components, totalCost }
  }

  const generateSystemRecommendations = () => {
    console.log("🎯 [Calculator] Generating system recommendations")

    const { projectType, substrate, area } = selections
    if (!projectType || !substrate) {
      console.warn("⚠️ [Calculator] Missing projectType or substrate")
      return
    }

    const systems = findCompatibleSystems(projectType, substrate)
    console.log("🔍 [Calculator] Found compatible systems:", systems.length)

    const systemsWithCosts = systems.map((system) => {
      const { components, totalCost } = calculateSystemCost(system.systemData, area)
      return {
        ...system,
        components,
        totalCost,
        area: Number.parseFloat(area),
      }
    })

    setAvailableSystems(systemsWithCosts)

    // Fetch Shopify prices for all components
    const allHandles = systemsWithCosts.flatMap((system) => system.components.map((comp: any) => comp.shopify_handle))
    console.log("📦 [Calculator] Fetching prices for handles:", allHandles)
    fetchShopifyPrices(allHandles)
  }

  const selectSystem = (system: any) => {
    console.log("✅ [Calculator] System selected:", system.systemData.name)
    setSelections((prev) => ({ ...prev, selectedSystem: system }))

    // Fetch color variants for the topcoat
    const topcoat = system.components.find((comp: any) => comp.componentType === "topcoat")
    if (topcoat && topcoat.has_color_variants) {
      console.log("🎨 [Calculator] Fetching color variants for topcoat:", topcoat.shopify_handle)
      fetchColorVariants(topcoat.shopify_handle)
    } else {
      console.log("ℹ️ [Calculator] No color variants needed for this system")
    }
  }

  const getBeadingOptions = () => {
    if (!selections.selectedSystem) return []
    const systemType = selections.selectedSystem.systemKey === "scratch" ? "scratch_render" : "thin_coat"
    return (systemsConfig.beading as any)[systemType] || []
  }

  const getAccessoryOptions = () => {
    const accessories = systemsConfig.accessories as any
    const categorizedAccessories: Record<string, any[]> = {}

    Object.entries(accessories).forEach(([category, items]: [string, any]) => {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1)
      categorizedAccessories[categoryName] = items.map((item: any) => ({
        ...item,
        price: getPrice(item.shopify_handle),
      }))
    })

    return categorizedAccessories
  }

  const updateBeadingQuantity = (beadId: string, quantity: number, selectedSize = "15mm") => {
    setSelections((prev) => ({
      ...prev,
      beading: prev.beading.map((bead) => {
        if (bead.id === beadId) {
          const variant = getBeadingVariant(bead, selectedSize)
          const price = variant ? variant.price : getPrice(bead.shopify_handle)
          return {
            ...bead,
            quantity,
            selectedSize,
            variantId: variant?.id,
            price,
            totalPrice: quantity * price,
          }
        }
        return bead
      }),
    }))
  }

  const addBeading = (beadItem: any) => {
    const defaultSize = beadItem.default_size || "15mm"
    const variant = getBeadingVariant(beadItem, defaultSize)
    const price = variant ? variant.price : getPrice(beadItem.shopify_handle)

    const beadWithQuantity = {
      ...beadItem,
      quantity: 1,
      selectedSize: defaultSize,
      variantId: variant?.id,
      price,
      totalPrice: price,
    }

    setSelections((prev) => ({
      ...prev,
      beading: [...prev.beading, beadWithQuantity],
    }))
  }

  const removeBeading = (beadId: string) => {
    setSelections((prev) => ({
      ...prev,
      beading: prev.beading.filter((b) => b.id !== beadId),
    }))
  }

  const toggleAccessory = (accessoryItem: any) => {
    const isSelected = selections.accessories.some((a) => a.id === accessoryItem.id)

    if (isSelected) {
      setSelections((prev) => ({
        ...prev,
        accessories: prev.accessories.filter((a) => a.id !== accessoryItem.id),
      }))
    } else {
      // Calculate optimal quantity for area-based accessories
      const area = Number.parseFloat(selections.area)
      const optimal = calculateOptimalQuantity(accessoryItem, area)

      setSelections((prev) => ({
        ...prev,
        accessories: [
          ...prev.accessories,
          {
            ...accessoryItem,
            ...optimal,
          },
        ],
      }))
    }
  }

  const calculateTotalCost = () => {
    let total = selections.selectedSystem?.totalCost || 0

    // Add beading costs
    selections.beading.forEach((bead) => {
      total += bead.totalPrice
    })

    // Add accessory costs
    selections.accessories.forEach((accessory) => {
      const discountedPrice = accessory.totalPrice * (1 - (accessory.bundle_discount || 0))
      total += discountedPrice
    })

    // Add color price adjustment
    if (selections.color) {
      const colorVariant = colorVariants.find((c) => c.id === selections.color)
      if (colorVariant?.price_adjustment) {
        const topcoat = selections.selectedSystem?.components.find((comp: any) => comp.componentType === "topcoat")
        if (topcoat) {
          total += topcoat.quantity * colorVariant.price_adjustment
        }
      }
    }

    return total
  }

  const addToShopifyCart = async (cartItems: any[]) => {
    try {
      const response = await fetch("/api/shopify/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cartItems }),
      })

      if (!response.ok) {
        throw new Error("Failed to add to Shopify cart")
      }

      const data = await response.json()

      // Redirect to Shopify checkout
      if (data.cart.checkoutUrl) {
        window.open(data.cart.checkoutUrl, "_blank")
      }

      return data.cart
    } catch (error) {
      console.error("Error adding to Shopify cart:", error)
      throw error
    }
  }

  const addToCart = () => {
    const cartItem = {
      id: Date.now(),
      selectedSystem: selections.selectedSystem,
      beading: selections.beading,
      accessories: selections.accessories,
      color: selections.color,
      totalCost: calculateTotalCost(),
      area: selections.area,
      projectType: selections.projectType,
      substrate: selections.substrate,
    }

    setCart([...cart, cartItem])

    // Reset for new calculation
    setSelections({
      projectType: null,
      substrate: null,
      area: "",
      selectedSystem: null,
      beading: [],
      accessories: [],
      color: null,
    })
    setAvailableSystems([])
    setColorVariants([])
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        generateSystemRecommendations()
      }
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getSubstrateOptions = () => {
    const projectTypes = systemsConfig.project_types as any
    return projectTypes[selections.projectType as string]?.substrates || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Render System Calculator</h1>
            <p className="text-gray-600 text-sm">
              Powered by Render Systems Online • Intelligent System Recommendations
            </p>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm">
            🛒 Cart ({cart.length})
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Main Calculator */}
          <div>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex justify-between text-xs text-gray-600 mb-2 overflow-x-auto">
                {steps.map((step, index) => (
                  <span
                    key={index}
                    className={`whitespace-nowrap ${index <= currentStep ? "text-blue-600 font-medium" : ""}`}
                  >
                    {step}
                  </span>
                ))}
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {currentStep + 1}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep]}</h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Step 0: Project Details */}
                {currentStep === 0 && (
                  <div>
                    <label className="block text-base font-medium text-gray-900 mb-4">What type of project?</label>
                    {errors.projectType && <p className="text-sm text-red-600 mb-4">{errors.projectType}</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {Object.entries(systemsConfig.project_types).map(([typeId, type]: [string, any]) => (
                        <div
                          key={typeId}
                          onClick={() => {
                            setSelections((prev) => ({ ...prev, projectType: typeId, substrate: null }))
                            setErrors((prev) => ({ ...prev, projectType: "" }))
                          }}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selections.projectType === typeId
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">
                              {typeId === "new-build" && "🏠"}
                              {typeId === "retrofit" && "🔄"}
                              {typeId === "ewi" && "🧱"}
                              {typeId === "maintenance" && "🔨"}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{type.name}</h3>
                              <p className="text-sm text-gray-600 leading-tight">{type.description}</p>
                            </div>
                            {selections.projectType === typeId && <div className="text-blue-600 text-xl">✓</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Substrate & Area */}
                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-4">Select substrate type</label>
                      {errors.substrate && <p className="text-sm text-red-600 mb-4">{errors.substrate}</p>}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                        {getSubstrateOptions().map((substrate: any) => (
                          <div
                            key={substrate.id}
                            onClick={() => {
                              setSelections((prev) => ({ ...prev, substrate: substrate.id }))
                              setErrors((prev) => ({ ...prev, substrate: "" }))
                            }}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                              selections.substrate === substrate.id
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm mb-1">{substrate.name}</h4>
                                <p className="text-xs text-gray-600 truncate">{substrate.description}</p>
                              </div>
                              {selections.substrate === substrate.id && <div className="text-blue-600 ml-2">✓</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-900 mb-2">Area to Render (m²) *</label>
                      {errors.area && <p className="text-sm text-red-600 mb-2">{errors.area}</p>}
                      <input
                        type="number"
                        placeholder="Enter area in square meters"
                        value={selections.area}
                        onChange={(e) => {
                          setSelections((prev) => ({ ...prev, area: e.target.value }))
                          setErrors((prev) => ({ ...prev, area: "" }))
                        }}
                        className={`w-full px-3 py-3 border-2 rounded-lg text-base outline-none transition-colors ${
                          errors.area ? "border-red-500" : "border-gray-300 focus:border-blue-600"
                        }`}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: System Recommendations */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Systems</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Based on your substrate selection, here are the compatible render systems. Our recommended
                        system is highlighted.
                      </p>
                      {errors.selectedSystem && <p className="text-sm text-red-600 mb-4">{errors.selectedSystem}</p>}
                    </div>

                    <div className="space-y-4">
                      {availableSystems.map((system, index) => (
                        <div
                          key={index}
                          onClick={() => selectSystem(system)}
                          className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                            selections.selectedSystem?.systemKey === system.systemKey
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                          } ${system.isRecommended ? "ring-2 ring-green-200" : ""}`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg font-bold text-gray-900">{system.systemData.name}</h4>
                                {system.isRecommended && (
                                  <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                                    ⭐ Recommended
                                  </span>
                                )}
                                {selections.selectedSystem?.systemKey === system.systemKey && (
                                  <span className="text-blue-600 text-xl">✓</span>
                                )}
                              </div>
                              <p className="text-gray-600 mb-3">{system.systemData.description}</p>
                              <p className="text-sm text-gray-700 mb-3">
                                <strong>Brand:</strong> {system.brandName}
                              </p>

                              {/* Performance Metrics */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center">
                                  <div className="text-lg font-bold text-blue-600">
                                    {system.systemData.performance.durability}/10
                                  </div>
                                  <div className="text-xs text-gray-600">Durability</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-green-600">
                                    {system.systemData.performance.ease_of_application}/10
                                  </div>
                                  <div className="text-xs text-gray-600">Ease of Use</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-purple-600">
                                    {system.systemData.performance.cost_effectiveness}/10
                                  </div>
                                  <div className="text-xs text-gray-600">Value</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-lg font-bold text-orange-600">
                                    {system.systemData.performance.weather_resistance}/10
                                  </div>
                                  <div className="text-xs text-gray-600">Weather</div>
                                </div>
                              </div>
                            </div>

                            <div className="text-right ml-6">
                              <div className="text-2xl font-bold text-gray-900">£{system.totalCost.toFixed(2)}</div>
                              <div className="text-sm text-gray-600">
                                £{(system.totalCost / system.area).toFixed(2)}/m²
                              </div>
                            </div>
                          </div>

                          {/* System Components */}
                          <div className="border-t border-gray-200 pt-4">
                            <h5 className="font-medium text-gray-900 mb-3">System Components:</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {system.components.map((component: any, compIndex: number) => (
                                <div key={compIndex} className="bg-gray-50 p-3 rounded">
                                  <div className="font-medium text-sm text-gray-900 mb-1">{component.name}</div>
                                  <div className="text-xs text-gray-600">
                                    Qty: {component.quantity} × {component.displayPrice} = £
                                    {component.totalPrice.toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
                      currentStep === 0 ? "text-gray-400 cursor-not-allowed" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    ← Previous
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={addToCart}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">ℹ️ Project Summary</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Project Type</label>
                <p className="text-sm text-gray-900">
                  {selections.projectType
                    ? (systemsConfig.project_types as any)[selections.projectType]?.name
                    : "Not selected"}
                </p>
              </div>

              {selections.substrate && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Substrate</label>
                  <p className="text-sm text-gray-900">
                    {getSubstrateOptions().find((s: any) => s.id === selections.substrate)?.name}
                  </p>
                </div>
              )}

              {selections.area && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Area</label>
                  <p className="text-sm text-gray-900">{selections.area} m²</p>
                </div>
              )}

              {selections.selectedSystem && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Selected System</label>
                  <p className="text-sm text-gray-900">{selections.selectedSystem.systemData.name}</p>
                </div>
              )}

              {selections.selectedSystem && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-600 block mb-1">Estimated Total</label>
                  <p className="text-lg font-bold text-gray-900">£{calculateTotalCost().toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calculator
