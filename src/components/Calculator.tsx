"use client"

import { useState } from "react"
import systemsConfig from "@/config/systems.json"

export default function Calculator() {
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
  const [shopifyPrices, setShopifyPrices] = useState<Record<string, any>>({})
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

  // Fetch Shopify prices
  const fetchShopifyPrices = async (handles: string[]) => {
    // This would connect to your Shopify API
    // For now, we'll use the JSON prices as fallback
    const prices: Record<string, any> = {}

    // Simulate API call - replace with actual Shopify integration
    handles.forEach((handle) => {
      prices[handle] = {
        price: null, // Will use JSON price as fallback
        variants: [],
      }
    })

    setShopifyPrices(prices)
  }

  const getPrice = (handle: string, variantId?: string) => {
    // Check Shopify price first, fallback to JSON
    const shopifyProduct = shopifyPrices[handle]
    if (shopifyProduct?.price) {
      if (variantId && shopifyProduct.variants) {
        const variant = shopifyProduct.variants.find((v: any) => v.id === variantId)
        return variant?.price || shopifyProduct.price
      }
      return shopifyProduct.price
    }

    // Fallback to JSON prices
    const brands = systemsConfig.brands as any
    for (const brand of Object.values(brands)) {
      for (const system of Object.values(brand.systems)) {
        for (const component of Object.values(system.components)) {
          if (component.shopify_handle === handle) {
            return component.price
          }
        }
      }
    }

    return 0
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
            isRecommended: false, // Will be set for highest scoring system
          })
        }
      })
    })

    // Sort by score and mark the highest as recommended
    compatibleSystems.sort((a, b) => b.score - a.score)
    if (compatibleSystems.length > 0) {
      compatibleSystems[0].isRecommended = true
    }

    return compatibleSystems
  }

  const calculateSystemCost = (systemData: any, area: string) => {
    const areaNum = Number.parseFloat(area)
    const components: any[] = []
    let totalCost = 0

    Object.entries(systemData.components).forEach(([componentKey, component]: [string, any]) => {
      const quantity = Math.ceil(areaNum / component.coverage_per_unit)
      const price = getPrice(component.shopify_handle)
      const totalPrice = quantity * price
      totalCost += totalPrice

      components.push({
        ...component,
        quantity,
        price,
        totalPrice,
        componentType: componentKey,
      })
    })

    return { components, totalCost }
  }

  const generateSystemRecommendations = () => {
    const { projectType, substrate, area } = selections
    if (!projectType || !substrate) return

    const systems = findCompatibleSystems(projectType, substrate)

    // Calculate costs for each system
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
    fetchShopifyPrices(allHandles)
  }

  const selectSystem = (system: any) => {
    setSelections((prev) => ({ ...prev, selectedSystem: system }))

    // Fetch color variants for the topcoat
    const topcoat = system.components.find((comp: any) => comp.componentType === "topcoat")
    if (topcoat) {
      fetchColorVariants(topcoat.shopify_handle)
    }
  }

  const fetchColorVariants = async (handle: string) => {
    // This would fetch from Shopify API
    // For now, simulate with default colors
    const defaultColors = [
      { id: "white", name: "Pure White", hex: "#FFFFFF", price_adjustment: 0 },
      { id: "cream", name: "Cream", hex: "#F5F5DC", price_adjustment: 0 },
      { id: "light-grey", name: "Light Grey", hex: "#D3D3D3", price_adjustment: 0 },
      { id: "dark-grey", name: "Dark Grey", hex: "#696969", price_adjustment: 5 },
      { id: "beige", name: "Beige", hex: "#F5F5DC", price_adjustment: 0 },
      { id: "sandstone", name: "Sandstone", hex: "#FAD5A5", price_adjustment: 3 },
    ]

    setColorVariants(defaultColors)
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
        price: getPrice(item.shopify_handle || `${item.id}-handle`),
      }))
    })

    return categorizedAccessories
  }

  const updateBeadingQuantity = (beadId: string, quantity: number) => {
    setSelections((prev) => ({
      ...prev,
      beading: prev.beading.map((bead) =>
        bead.id === beadId
          ? { ...bead, quantity, totalPrice: quantity * getPrice(bead.shopify_handle || `${bead.id}-handle`) }
          : bead,
      ),
    }))
  }

  const addBeading = (beadItem: any) => {
    const price = getPrice(beadItem.shopify_handle || `${beadItem.id}-handle`)
    const beadWithQuantity = {
      ...beadItem,
      quantity: 1,
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
      setSelections((prev) => ({
        ...prev,
        accessories: [...prev.accessories, accessoryItem],
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
      const discountedPrice = accessory.price * (1 - (accessory.bundle_discount || 0))
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
                                    Qty: {component.quantity} × £{component.price.toFixed(2)} = £
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

                {/* Step 3: Select Beading */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Beading (Optional)</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Add beading to protect edges and corners. Specify the exact quantities you need.
                      </p>
                    </div>

                    {/* Available Beading */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Available Beading Options</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getBeadingOptions().map((bead: any) => {
                          const isAdded = selections.beading.some((b) => b.id === bead.id)
                          const price = getPrice(bead.shopify_handle || `${bead.id}-handle`)

                          return (
                            <div
                              key={bead.id}
                              className={`p-4 border-2 rounded-lg ${
                                bead.recommended ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h5 className="font-medium text-gray-900">{bead.name}</h5>
                                    {bead.recommended && (
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                        Recommended
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{bead.description}</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    £{price.toFixed(2)} per {bead.length}m length
                                  </p>
                                </div>
                              </div>

                              {!isAdded ? (
                                <button
                                  onClick={() => addBeading(bead)}
                                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                  Add to Selection
                                </button>
                              ) : (
                                <div className="text-center text-sm text-green-600 font-medium">
                                  ✓ Added to selection
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Selected Beading */}
                    {selections.beading.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-4">Selected Beading</h4>
                        <div className="space-y-4">
                          {selections.beading.map((bead, index) => (
                            <div key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg border">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{bead.name}</h5>
                                <p className="text-sm text-gray-600">
                                  £{bead.price.toFixed(2)} per {bead.length}m length
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Qty:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={bead.quantity}
                                  onChange={(e) => updateBeadingQuantity(bead.id, Number.parseInt(e.target.value) || 1)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                />
                              </div>

                              <div className="text-right">
                                <div className="font-medium text-gray-900">£{bead.totalPrice.toFixed(2)}</div>
                              </div>

                              <button
                                onClick={() => removeBeading(bead.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">Beading Total:</span>
                            <span className="font-bold text-gray-900">
                              £{selections.beading.reduce((sum, b) => sum + b.totalPrice, 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Add Accessories */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Accessories (Optional)</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Enhance your project with professional tools and accessories. Bundle discounts applied
                        automatically.
                      </p>
                    </div>

                    {Object.entries(getAccessoryOptions()).map(([category, accessories]: [string, any[]]) => (
                      <div key={category} className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">{category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {accessories.map((accessory: any) => {
                            const isSelected = selections.accessories.some((a) => a.id === accessory.id)
                            const discountedPrice = accessory.price * (1 - (accessory.bundle_discount || 0))
                            const savings = accessory.price - discountedPrice

                            return (
                              <div
                                key={accessory.id}
                                onClick={() => toggleAccessory(accessory)}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900 mb-2">{accessory.name}</h5>
                                    <div className="text-sm text-gray-700 mb-2">
                                      {savings > 0 ? (
                                        <div>
                                          <span className="line-through text-gray-500">
                                            £{accessory.price.toFixed(2)}
                                          </span>
                                          <span className="ml-2 font-medium text-green-600">
                                            £{discountedPrice.toFixed(2)}
                                          </span>
                                          <span className="ml-1 text-xs text-green-600">
                                            (Save £{savings.toFixed(2)})
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="font-medium">£{accessory.price.toFixed(2)}</span>
                                      )}
                                    </div>
                                    {accessory.bundle_discount && (
                                      <p className="text-xs text-green-600 mb-1">
                                        {Math.round(accessory.bundle_discount * 100)}% bundle discount applied
                                      </p>
                                    )}
                                  </div>
                                  {isSelected && <div className="text-blue-600 text-xl ml-2">✓</div>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}

                    {selections.accessories.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Selected Accessories</h4>
                        <div className="space-y-2">
                          {selections.accessories.map((accessory, index) => {
                            const discountedPrice = accessory.price * (1 - (accessory.bundle_discount || 0))
                            return (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{accessory.name}</span>
                                <span>£{discountedPrice.toFixed(2)}</span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">Accessories Total:</span>
                            <span className="font-bold text-gray-900">
                              £
                              {selections.accessories
                                .reduce((sum, a) => sum + a.price * (1 - (a.bundle_discount || 0)), 0)
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 5: Color Selection */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Choose Color</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Select your preferred render color. Some colors may have additional costs.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {colorVariants.map((color) => (
                        <div
                          key={color.id}
                          onClick={() => setSelections((prev) => ({ ...prev, color: color.id }))}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selections.color === color.id
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div
                              className="w-16 h-16 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="text-center">
                              <h4 className="font-medium text-gray-900">{color.name}</h4>
                              {color.price_adjustment > 0 && (
                                <p className="text-xs text-orange-600 mt-1">
                                  +£{color.price_adjustment.toFixed(2)} per bag
                                </p>
                              )}
                              {selections.color === color.id && <div className="text-blue-600 text-lg mt-1">✓</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 6: Review & Add to Cart */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Your Selection</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Review your complete render system package before adding to cart.
                      </p>
                    </div>

                    {/* System Summary */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Render System</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>System:</strong> {selections.selectedSystem?.systemData.name}
                        </p>
                        <p>
                          <strong>Brand:</strong> {selections.selectedSystem?.brandName}
                        </p>
                        <p>
                          <strong>Area:</strong> {selections.area}m²
                        </p>
                        <p>
                          <strong>Project:</strong>{" "}
                          {(systemsConfig.project_types as any)[selections.projectType!]?.name}
                        </p>
                        <p>
                          <strong>Substrate:</strong>{" "}
                          {getSubstrateOptions().find((s: any) => s.id === selections.substrate)?.name}
                        </p>
                        {selections.color && (
                          <p>
                            <strong>Color:</strong> {colorVariants.find((c) => c.id === selections.color)?.name}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="font-semibold text-green-800">
                          System Cost: £{selections.selectedSystem?.totalCost.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Beading Summary */}
                    {selections.beading.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">Beading</h4>
                        <div className="space-y-1 text-sm">
                          {selections.beading.map((bead, index) => (
                            <div key={index} className="flex justify-between">
                              <span>
                                {bead.name} (×{bead.quantity})
                              </span>
                              <span>£{bead.totalPrice.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <p className="font-semibold text-blue-800">
                            Beading Total: £{selections.beading.reduce((sum, b) => sum + b.totalPrice, 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Accessories Summary */}
                    {selections.accessories.length > 0 && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-800 mb-2">Accessories</h4>
                        <div className="space-y-1 text-sm">
                          {selections.accessories.map((accessory, index) => {
                            const discountedPrice = accessory.price * (1 - (accessory.bundle_discount || 0))
                            return (
                              <div key={index} className="flex justify-between">
                                <span>{accessory.name}</span>
                                <span>£{discountedPrice.toFixed(2)}</span>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <p className="font-semibold text-purple-800">
                            Accessories Total: £
                            {selections.accessories
                              .reduce((sum, a) => sum + a.price * (1 - (a.bundle_discount || 0)), 0)
                              .toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Grand Total */}
                    <div className="bg-gray-900 text-white rounded-lg p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-xl font-bold mb-1">Total Project Cost</h4>
                          <p className="text-gray-300">Complete render system package</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold">£{calculateTotalCost().toFixed(2)}</p>
                          <p className="text-gray-300">
                            £{(calculateTotalCost() / Number.parseFloat(selections.area)).toFixed(2)}/m²
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={addToCart}
                      className="w-full bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
                    >
                      Add Complete Package to Cart
                    </button>
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
                      onClick={() => {
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
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      Start New Calculation
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

              {selections.beading.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Beading</label>
                  <p className="text-sm text-gray-900">{selections.beading.length} items selected</p>
                </div>
              )}

              {selections.accessories.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Accessories</label>
                  <p className="text-sm text-gray-900">{selections.accessories.length} items selected</p>
                </div>
              )}

              {selections.color && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Color</label>
                  <p className="text-sm text-gray-900">{colorVariants.find((c) => c.id === selections.color)?.name}</p>
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
