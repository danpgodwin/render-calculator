"use client"

import { useState } from "react"
import systemsConfig from "@/config/systems.json"

export default function Calculator() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState({
    projectType: null as string | null,
    substrate: null as string | null,
    area: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [recommendation, setRecommendation] = useState<any>(null)

  const steps = ["Project Details", "Substrate & Area", "System Recommendations"]

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
    })
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
            🛒 Cart (0)
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
                          <h4 className="font-semibold text-blue-900 mb-1">Total System Cost</h4>
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

                  <button
                    onClick={nextStep}
                    disabled={currentStep === steps.length - 1}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                      currentStep === steps.length - 1
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Next →
                  </button>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
