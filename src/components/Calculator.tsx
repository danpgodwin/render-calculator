"use client"

import { useState } from "react"
import systemsConfig from "@/config/systems.json"

export default function Calculator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState({
    projectType: null as string | null,
    substrate: null as string | null,
    area: "",
    beading: [] as any[],
    accessories: [] as any[],
    color: null as string | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [recommendation, setRecommendation] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])

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

    // Steps 3-6 are optional, no validation needed

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const findBestSystem = (projectType: string, substrate: string) => {
    const brands = systemsConfig.brands
    let bestMatch = null
    let bestScore = 0

    Object.entries(brands).forEach(([brandKey, brand]: [string, any]) => {
      Object.entries(brand.systems).forEach(([systemKey, system]: [string, any]) => {
        if (system.suitable_substrates.includes(substrate)) {
          const score =
            system.performance.durability +
            system.performance.ease_of_application +
            system.performance.cost_effectiveness +
            system.performance.weather_resistance

          if (score > bestScore) {
            bestScore = score
            bestMatch = {
              brand: brandKey,
              brandName: brand.name,
              system: systemKey,
              systemData: system,
              systemType: systemKey,
              score: score,
            }
          }
        }
      })
    })

    return bestMatch
  }

  const calculateQuantities = (systemData: any, area: string) => {
    const areaNum = Number.parseFloat(area)
    const components: any[] = []
    let totalCost = 0

    Object.entries(systemData.components).forEach(([componentKey, component]: [string, any]) => {
      const quantity = Math.ceil(areaNum / component.coverage_per_unit)
      const totalPrice = quantity * component.price
      totalCost += totalPrice

      components.push({
        ...component,
        quantity,
        totalPrice,
        componentType: componentKey,
      })
    })

    return { components, totalCost }
  }

  const generateRecommendation = () => {
    const { projectType, substrate, area } = selections
    if (!projectType || !substrate) return

    const bestSystem = findBestSystem(projectType, substrate)

    if (!bestSystem) return

    const { components, totalCost } = calculateQuantities(bestSystem.systemData, area)

    setRecommendation({
      brand: bestSystem.brandName,
      system: bestSystem.systemData.name,
      description: bestSystem.systemData.description,
      components,
      totalCost,
      area: Number.parseFloat(area),
      performance: bestSystem.systemData.performance,
      systemType: bestSystem.systemType,
    })
  }

  const getBeadingOptions = () => {
    if (!recommendation) return []
    const systemType = recommendation.systemType === "scratch" ? "scratch_render" : "thin_coat"
    return (systemsConfig.beading as any)[systemType] || []
  }

  const getAccessoryOptions = () => {
    const accessories = systemsConfig.accessories as any
    const allAccessories: any[] = []

    Object.entries(accessories).forEach(([category, items]: [string, any]) => {
      items.forEach((item: any) => {
        allAccessories.push({
          ...item,
          category: category.charAt(0).toUpperCase() + category.slice(1),
        })
      })
    })

    return allAccessories
  }

  const calculateBeadingQuantity = (beadItem: any) => {
    const area = Number.parseFloat(selections.area)
    // Estimate: roughly 1 linear meter of beading per 3m² of area
    const estimatedLinearMeters = Math.ceil(area / 3)
    return Math.ceil(estimatedLinearMeters / beadItem.length)
  }

  const calculateTotalCost = () => {
    let total = recommendation?.totalCost || 0

    // Add beading costs
    selections.beading.forEach((bead) => {
      total += bead.totalPrice
    })

    // Add accessory costs
    selections.accessories.forEach((accessory) => {
      const discountedPrice = accessory.price * (1 - (accessory.bundle_discount || 0))
      total += discountedPrice
    })

    return total
  }

  const addToCart = () => {
    const cartItem = {
      id: Date.now(),
      recommendation,
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
      beading: [],
      accessories: [],
      color: null,
    })
    setRecommendation(null)
    setCurrentStep(0)
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1) {
        generateRecommendation()
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

  const toggleBeading = (beadItem: any) => {
    const quantity = calculateBeadingQuantity(beadItem)
    const totalPrice = quantity * beadItem.price
    const beadWithQuantity = { ...beadItem, quantity, totalPrice }

    const isSelected = selections.beading.some((b) => b.id === beadItem.id)

    if (isSelected) {
      setSelections((prev) => ({
        ...prev,
        beading: prev.beading.filter((b) => b.id !== beadItem.id),
      }))
    } else {
      setSelections((prev) => ({
        ...prev,
        beading: [...prev.beading, beadWithQuantity],
      }))
    }
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

  const colors = [
    { id: "white", name: "Pure White", hex: "#FFFFFF" },
    { id: "cream", name: "Cream", hex: "#F5F5DC" },
    { id: "light-grey", name: "Light Grey", hex: "#D3D3D3" },
    { id: "dark-grey", name: "Dark Grey", hex: "#696969" },
    { id: "beige", name: "Beige", hex: "#F5F5DC" },
    { id: "sandstone", name: "Sandstone", hex: "#FAD5A5" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
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
                {currentStep === 2 && recommendation && (
                  <div className="space-y-8">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600 text-xl">✓</span>
                        <h3 className="font-semibold text-green-800">Recommended System</h3>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-1">{recommendation.system}</h4>
                      <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
                      <p className="text-sm text-green-800">
                        <strong>Brand:</strong> {recommendation.brand}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-4">System Components</h4>
                      <div className="space-y-3">
                        {recommendation.components.map((component: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900 mb-1">{component.name}</h5>
                              <p className="text-sm text-gray-600">
                                Quantity: {component.quantity} × £{component.price.toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">£{component.totalPrice.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-1">System Cost</h4>
                          <p className="text-sm text-blue-800">For {recommendation.area}m² coverage</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-900 mb-1">
                            £{recommendation.totalCost.toFixed(2)}
                          </p>
                          <p className="text-sm text-blue-800">
                            £{(recommendation.totalCost / recommendation.area).toFixed(2)}/m²
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Select Beading */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Beading (Optional)</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Choose beading options to protect edges and corners. Quantities are automatically calculated
                        based on your area.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getBeadingOptions().map((bead: any) => {
                        const isSelected = selections.beading.some((b) => b.id === bead.id)
                        const quantity = calculateBeadingQuantity(bead)
                        const totalPrice = quantity * bead.price

                        return (
                          <div
                            key={bead.id}
                            onClick={() => toggleBeading(bead)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            } ${bead.recommended ? "ring-2 ring-green-200" : ""}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900">{bead.name}</h4>
                                  {bead.recommended && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                      Recommended
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{bead.description}</p>
                                <div className="text-sm text-gray-700">
                                  <p>
                                    Quantity needed: {quantity} × £{bead.price.toFixed(2)}
                                  </p>
                                  <p className="font-medium">Total: £{totalPrice.toFixed(2)}</p>
                                </div>
                              </div>
                              {isSelected && <div className="text-blue-600 text-xl ml-2">✓</div>}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {selections.beading.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Selected Beading</h4>
                        <div className="space-y-2">
                          {selections.beading.map((bead, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>
                                {bead.name} (×{bead.quantity})
                              </span>
                              <span className="font-medium">£{bead.totalPrice.toFixed(2)}</span>
                            </div>
                          ))}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getAccessoryOptions().map((accessory: any) => {
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
                                : "border-gray-200 bg-white hover:border-gray-300"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-gray-900">{accessory.name}</h4>
                                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                    {accessory.category}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-700 mb-2">
                                  {savings > 0 ? (
                                    <div>
                                      <span className="line-through text-gray-500">£{accessory.price.toFixed(2)}</span>
                                      <span className="ml-2 font-medium text-green-600">
                                        £{discountedPrice.toFixed(2)}
                                      </span>
                                      <span className="ml-1 text-xs text-green-600">(Save £{savings.toFixed(2)})</span>
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

                    {selections.accessories.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Selected Accessories</h4>
                        <div className="space-y-2">
                          {selections.accessories.map((accessory, index) => {
                            const discountedPrice = accessory.price * (1 - (accessory.bundle_discount || 0))
                            return (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{accessory.name}</span>
                                <span className="font-medium">£{discountedPrice.toFixed(2)}</span>
                              </div>
                            )
                          })}
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
                        Select your preferred render color. All colors are available at no extra cost.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {colors.map((color) => (
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
                          <strong>System:</strong> {recommendation?.system}
                        </p>
                        <p>
                          <strong>Brand:</strong> {recommendation?.brand}
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
                            <strong>Color:</strong> {colors.find((c) => c.id === selections.color)?.name}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200">
                        <p className="font-semibold text-green-800">
                          System Cost: £{recommendation?.totalCost.toFixed(2)}
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
                        // Reset for new calculation
                        setSelections({
                          projectType: null,
                          substrate: null,
                          area: "",
                          beading: [],
                          accessories: [],
                          color: null,
                        })
                        setRecommendation(null)
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

              {recommendation && (
                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-1">Recommended System</label>
                  <p className="text-sm text-gray-900">{recommendation.system}</p>
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
                  <p className="text-sm text-gray-900">{colors.find((c) => c.id === selections.color)?.name}</p>
                </div>
              )}

              {recommendation && (
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
