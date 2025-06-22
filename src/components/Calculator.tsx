"use client"

import { useState } from "react"
import systemsConfig from "@/config/systems.json"

// Add proper type definitions
interface ProjectType {
  name: string
  description: string
  substrates: Substrate[]
}

interface Substrate {
  id: string
  name: string
  description: string
}

interface SystemComponent {
  name: string
  shopify_handle: string
  price: number
  coverage_per_unit: number
  unit: string
}

interface SystemData {
  name: string
  description: string
  components: Record<string, SystemComponent>
  suitable_substrates: string[]
  performance: {
    durability: number
    ease_of_application: number
    cost_effectiveness: number
    weather_resistance: number
  }
}

interface Selections {
  projectType: string | null
  substrate: string | null
  area: string
}

interface Errors {
  projectType?: string
  substrate?: string
  area?: string
}

interface RecommendationComponent extends SystemComponent {
  quantity: number
  totalPrice: number
  componentType: string
}

interface Recommendation {
  brand: string
  system: string
  description: string
  components: RecommendationComponent[]
  totalCost: number
  area: number
  performance: SystemData["performance"]
}

export default function Calculator() {
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [selections, setSelections] = useState<Selections>({
    projectType: null,
    substrate: null,
    area: "",
  })
  const [errors, setErrors] = useState<Errors>({})
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)

  // Rest of your component code remains the same...
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
    const newErrors: Errors = {}

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

    Object.entries(brands).forEach(([brandKey, brand]) => {
      Object.entries(brand.systems).forEach(([systemKey, system]) => {
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

  const calculateQuantities = (systemData: SystemData, area: string) => {
    const areaNum = Number.parseFloat(area)
    const components: RecommendationComponent[] = []
    let totalCost = 0

    Object.entries(systemData.components).forEach(([componentKey, component]) => {
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

  const getSubstrateOptions = (): Substrate[] => {
    return (
      systemsConfig.project_types[selections.projectType as keyof typeof systemsConfig.project_types]?.substrates || []
    )
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%)",
        padding: "1rem",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#111827",
                margin: "0 0 0.5rem 0",
              }}
            >
              Enhanced Render System Calculator
            </h1>
            <p
              style={{
                color: "#6b7280",
                margin: 0,
                fontSize: "0.875rem",
              }}
            >
              Powered by Render Systems Online • Intelligent System Recommendations
            </p>
          </div>

          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              background: "white",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            🛒 Cart (0)
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "2rem",
          }}
        >
          {/* Main Calculator */}
          <div>
            {/* Progress */}
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  marginBottom: "0.5rem",
                  overflowX: "auto",
                }}
              >
                {steps.map((step, index) => (
                  <span
                    key={index}
                    style={{
                      whiteSpace: "nowrap",
                      color: index <= currentStep ? "#2563eb" : "#6b7280",
                      fontWeight: index <= currentStep ? "500" : "normal",
                    }}
                  >
                    {step}
                  </span>
                ))}
              </div>
              <div
                style={{
                  width: "100%",
                  height: "0.5rem",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "0.25rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    backgroundColor: "#2563eb",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Step Content */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "0.5rem",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "1.5rem",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: "#2563eb",
                      color: "white",
                      borderRadius: "50%",
                      width: "2rem",
                      height: "2rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                    }}
                  >
                    {currentStep + 1}
                  </span>
                  <h2
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "600",
                      margin: 0,
                      color: "#111827",
                    }}
                  >
                    {steps[currentStep]}
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "1.5rem" }}>
                {/* Step 0: Project Details */}
                {currentStep === 0 && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "1rem",
                        fontWeight: "500",
                        color: "#111827",
                        marginBottom: "1rem",
                      }}
                    >
                      What type of project?
                    </label>
                    {errors.projectType && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#dc2626",
                          margin: "0 0 1rem 0",
                        }}
                      >
                        {errors.projectType}
                      </p>
                    )}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "1rem",
                        marginTop: "1rem",
                      }}
                    >
                      {Object.entries(systemsConfig.project_types).map(([typeId, type]) => (
                        <div
                          key={typeId}
                          onClick={() => {
                            setSelections((prev) => ({ ...prev, projectType: typeId, substrate: null }))
                            setErrors((prev) => ({ ...prev, projectType: null }))
                          }}
                          style={{
                            padding: "1rem",
                            border: `2px solid ${selections.projectType === typeId ? "#2563eb" : "#e5e7eb"}`,
                            borderRadius: "0.5rem",
                            cursor: "pointer",
                            backgroundColor: selections.projectType === typeId ? "#eff6ff" : "white",
                            transition: "all 0.2s ease",
                            boxShadow: selections.projectType === typeId ? "0 0 0 3px rgba(37, 99, 235, 0.1)" : "none",
                          }}
                          onMouseEnter={(e) => {
                            if (selections.projectType !== typeId) {
                              e.target.style.borderColor = "#9ca3af"
                              e.target.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selections.projectType !== typeId) {
                              e.target.style.borderColor = "#e5e7eb"
                              e.target.style.boxShadow = "none"
                            }
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "2rem",
                                flexShrink: 0,
                              }}
                            >
                              {typeId === "new-build" && "🏠"}
                              {typeId === "retrofit" && "🔄"}
                              {typeId === "ewi" && "🧱"}
                              {typeId === "maintenance" && "🔨"}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h3
                                style={{
                                  fontWeight: "600",
                                  color: "#111827",
                                  margin: "0 0 0.25rem 0",
                                  fontSize: "1rem",
                                }}
                              >
                                {type.name}
                              </h3>
                              <p
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#6b7280",
                                  margin: 0,
                                  lineHeight: "1.4",
                                }}
                              >
                                {type.description}
                              </p>
                            </div>
                            {selections.projectType === typeId && (
                              <div
                                style={{
                                  color: "#2563eb",
                                  fontSize: "1.25rem",
                                  flexShrink: 0,
                                }}
                              >
                                ✓
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Substrate & Area */}
                {currentStep === 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "1rem",
                          fontWeight: "500",
                          color: "#111827",
                          marginBottom: "1rem",
                        }}
                      >
                        Select substrate type
                      </label>
                      {errors.substrate && (
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "#dc2626",
                            margin: "0 0 1rem 0",
                          }}
                        >
                          {errors.substrate}
                        </p>
                      )}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "0.75rem",
                          maxHeight: "300px",
                          overflowY: "auto",
                          padding: "0.5rem",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.375rem",
                        }}
                      >
                        {getSubstrateOptions().map((substrate) => (
                          <div
                            key={substrate.id}
                            onClick={() => {
                              setSelections((prev) => ({ ...prev, substrate: substrate.id }))
                              setErrors((prev) => ({ ...prev, substrate: null }))
                            }}
                            style={{
                              padding: "0.75rem",
                              border: `2px solid ${selections.substrate === substrate.id ? "#2563eb" : "#e5e7eb"}`,
                              borderRadius: "0.375rem",
                              cursor: "pointer",
                              backgroundColor: selections.substrate === substrate.id ? "#eff6ff" : "white",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h4
                                  style={{
                                    fontWeight: "500",
                                    color: "#111827",
                                    margin: "0 0 0.25rem 0",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {substrate.name}
                                </h4>
                                <p
                                  style={{
                                    fontSize: "0.75rem",
                                    color: "#6b7280",
                                    margin: 0,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {substrate.description}
                                </p>
                              </div>
                              {selections.substrate === substrate.id && (
                                <div
                                  style={{
                                    color: "#2563eb",
                                    fontSize: "1rem",
                                    marginLeft: "0.5rem",
                                    flexShrink: 0,
                                  }}
                                >
                                  ✓
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "1rem",
                          fontWeight: "500",
                          color: "#111827",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Area to Render (m²) *
                      </label>
                      {errors.area && (
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "#dc2626",
                            margin: "0 0 0.5rem 0",
                          }}
                        >
                          {errors.area}
                        </p>
                      )}
                      <input
                        type="number"
                        placeholder="Enter area in square meters"
                        value={selections.area}
                        onChange={(e) => {
                          setSelections((prev) => ({ ...prev, area: e.target.value }))
                          setErrors((prev) => ({ ...prev, area: null }))
                        }}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: `2px solid ${errors.area ? "#dc2626" : "#e5e7eb"}`,
                          borderRadius: "0.375rem",
                          fontSize: "1rem",
                          outline: "none",
                          transition: "border-color 0.2s ease",
                        }}
                        onFocus={(e) => {
                          if (!errors.area) {
                            e.target.style.borderColor = "#2563eb"
                          }
                        }}
                        onBlur={(e) => {
                          if (!errors.area) {
                            e.target.style.borderColor = "#e5e7eb"
                          }
                        }}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: System Recommendations */}
                {currentStep === 2 && recommendation && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    <div
                      style={{
                        backgroundColor: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span style={{ color: "#16a34a", fontSize: "1.25rem" }}>✓</span>
                        <h3
                          style={{
                            fontWeight: "600",
                            color: "#15803d",
                            margin: 0,
                          }}
                        >
                          Recommended System
                        </h3>
                      </div>
                      <h4
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: "bold",
                          color: "#111827",
                          margin: "0 0 0.25rem 0",
                        }}
                      >
                        {recommendation.system}
                      </h4>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#6b7280",
                          margin: "0 0 0.5rem 0",
                        }}
                      >
                        {recommendation.description}
                      </p>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#15803d",
                          margin: 0,
                        }}
                      >
                        <strong>Brand:</strong> {recommendation.brand}
                      </p>
                    </div>

                    <div>
                      <h4
                        style={{
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: "1rem",
                        }}
                      >
                        System Components
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {recommendation.components.map((component, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "0.75rem",
                              backgroundColor: "#f9fafb",
                              borderRadius: "0.5rem",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <h5
                                style={{
                                  fontWeight: "500",
                                  color: "#111827",
                                  margin: "0 0 0.25rem 0",
                                }}
                              >
                                {component.name}
                              </h5>
                              <p
                                style={{
                                  fontSize: "0.875rem",
                                  color: "#6b7280",
                                  margin: 0,
                                }}
                              >
                                Quantity: {component.quantity} × £{component.price.toFixed(2)}
                              </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <p
                                style={{
                                  fontWeight: "600",
                                  color: "#111827",
                                  margin: 0,
                                }}
                              >
                                £{component.totalPrice.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <h4
                            style={{
                              fontWeight: "600",
                              color: "#1e40af",
                              margin: "0 0 0.25rem 0",
                            }}
                          >
                            Total System Cost
                          </h4>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              color: "#3730a3",
                              margin: 0,
                            }}
                          >
                            For {recommendation.area}m² coverage
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p
                            style={{
                              fontSize: "2rem",
                              fontWeight: "bold",
                              color: "#1e40af",
                              margin: "0 0 0.25rem 0",
                            }}
                          >
                            £{recommendation.totalCost.toFixed(2)}
                          </p>
                          <p
                            style={{
                              fontSize: "0.875rem",
                              color: "#3730a3",
                              margin: 0,
                            }}
                          >
                            £{(recommendation.totalCost / recommendation.area).toFixed(2)}/m²
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "2rem",
                    borderTop: "1px solid #e5e7eb",
                    marginTop: "2rem",
                  }}
                >
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      backgroundColor: "white",
                      color: currentStep === 0 ? "#9ca3af" : "#374151",
                      cursor: currentStep === 0 ? "not-allowed" : "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                    }}
                  >
                    ← Previous
                  </button>

                  <button
                    onClick={nextStep}
                    disabled={currentStep === steps.length - 1}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      border: "none",
                      borderRadius: "0.375rem",
                      backgroundColor: currentStep === steps.length - 1 ? "#9ca3af" : "#2563eb",
                      color: "white",
                      cursor: currentStep === steps.length - 1 ? "not-allowed" : "pointer",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              padding: "1.5rem",
              height: "fit-content",
            }}
          >
            <h3
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#111827",
                margin: "0 0 1rem 0",
              }}
            >
              ℹ️ Project Summary
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "#6b7280",
                    display: "block",
                    marginBottom: "0.25rem",
                  }}
                >
                  Project Type
                </label>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#111827",
                    margin: 0,
                  }}
                >
                  {selections.projectType ? systemsConfig.project_types[selections.projectType]?.name : "Not selected"}
                </p>
              </div>

              {selections.substrate && (
                <div>
                  <label
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#6b7280",
                      display: "block",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Substrate
                  </label>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {getSubstrateOptions().find((s) => s.id === selections.substrate)?.name}
                  </p>
                </div>
              )}

              {selections.area && (
                <div>
                  <label
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#6b7280",
                      display: "block",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Area
                  </label>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {selections.area} m²
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
