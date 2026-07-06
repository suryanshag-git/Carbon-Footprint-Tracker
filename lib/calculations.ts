import {
  EMISSION_FACTORS,
  EmissionCategory,
  REGIONAL_GRID_EMISSIONS,
  FLIGHT_CLASS_MULTIPLIERS,
  FUEL_LITER_CO2,
  VEHICLE_SIZE_MULTIPLIERS,
  DIET_FOOD_FACTORS,
  ENERGY_SOURCE_CO2,
  SHOPPING_MATERIAL_FACTORS,
  TREE_SEQUESTRATION,
  RECYCLING_SAVE_FACTORS,
  RegionCode,
  TravelSubcategory,
  DietSubcategory,
  EnergySubcategory,
  ShoppingSubcategory,
  ActionSubcategory
} from "./emission_factors"

/**
 * Calculates CO2 equivalent emissions in kg.
 * Supports country-specific grid mixes and detailed nuanced inputs (efficiency, food items, etc.).
 * 
 * @param category The main category of activity ('travel', 'diet', etc.)
 * @param subcategory The specific subcategory (e.g. 'car_petrol', 'beef')
 * @param amount The numerical amount (e.g. km traveled, kg food, kWh)
 * @param details Optional rich parameters for advanced/nuanced computations
 * @returns The calculated CO2 equivalent emissions in kg.
 */
export function calculateCO2(
  category: EmissionCategory,
  subcategory: string,
  amount: number,
  details?: Record<string, any>
): number {
  if (amount <= 0) return 0

  const region: RegionCode = (details?.region as RegionCode) || "IN"
  const regionalGrid = REGIONAL_GRID_EMISSIONS[region] || REGIONAL_GRID_EMISSIONS.IN

  switch (category) {
    case "travel": {
      // 1. Aviation (flight_short, flight_long)
      if (subcategory === "flight_short" || subcategory === "flight_long") {
        const baseFactor = EMISSION_FACTORS.travel[subcategory]
        const flightClass = (details?.flight_class as keyof typeof FLIGHT_CLASS_MULTIPLIERS) || "economy"
        const multiplier = FLIGHT_CLASS_MULTIPLIERS[flightClass] || 1.0
        return Number((amount * baseFactor * multiplier).toFixed(2))
      }

      // 2. Road transport with fuel efficiency (km/L or km/kWh)
      if (details?.fuel_efficiency && details?.fuel_type) {
        const fuelType = details.fuel_type as keyof typeof FUEL_LITER_CO2 | "electric"
        if (fuelType === "electric") {
          const kWhConsumed = amount / details.fuel_efficiency
          const electricityFactor = regionalGrid.electricity
          return Number((kWhConsumed * electricityFactor).toFixed(2))
        } else if (fuelType in FUEL_LITER_CO2) {
          const litersConsumed = amount / details.fuel_efficiency
          const fuelFactor = FUEL_LITER_CO2[fuelType as keyof typeof FUEL_LITER_CO2]
          return Number((litersConsumed * fuelFactor).toFixed(2))
        }
      }

      // 3. Road transport with vehicle size multiplier fallback
      const baseFactor = EMISSION_FACTORS.travel[subcategory as TravelSubcategory] || 0.17
      const vehicleSize = (details?.vehicle_size as keyof typeof VEHICLE_SIZE_MULTIPLIERS) || "medium"
      const sizeMultiplier = VEHICLE_SIZE_MULTIPLIERS[vehicleSize] || 1.0
      return Number((amount * baseFactor * sizeMultiplier).toFixed(2))
    }

    case "diet": {
      // If specific food item is selected
      if (details?.food_item) {
        const foodItem = details.food_item as keyof typeof DIET_FOOD_FACTORS
        if (foodItem in DIET_FOOD_FACTORS) {
          const factor = DIET_FOOD_FACTORS[foodItem]
          return Number((amount * factor).toFixed(2))
        }
      }
      // Fallback to subcategory
      const baseFactor = EMISSION_FACTORS.diet[subcategory as DietSubcategory] || 1.5
      return Number((amount * baseFactor).toFixed(2))
    }

    case "energy": {
      if (subcategory === "electricity") {
        // Source Mix (e.g. { coal: 60, solar: 20, wind: 20 } representing percentages)
        if (details?.source_mix && typeof details.source_mix === "object") {
          let weightedFactor = 0
          let totalPercentage = 0
          for (const [source, percent] of Object.entries(details.source_mix)) {
            const p = Number(percent)
            const sourceKey = source as keyof typeof ENERGY_SOURCE_CO2
            if (sourceKey in ENERGY_SOURCE_CO2 && p > 0) {
              weightedFactor += p * ENERGY_SOURCE_CO2[sourceKey]
              totalPercentage += p
            }
          }
          if (totalPercentage > 0) {
            const normalizedFactor = weightedFactor / totalPercentage
            return Number((amount * normalizedFactor).toFixed(2))
          }
        }
        // Fallback to regional grid electricity factor
        return Number((amount * regionalGrid.electricity).toFixed(2))
      }

      if (subcategory === "water") {
        return Number((amount * regionalGrid.water).toFixed(2))
      }

      // Fallback for natural_gas, heating_oil
      const baseFactor = EMISSION_FACTORS.energy[subcategory as EnergySubcategory] || 0.18
      return Number((amount * baseFactor).toFixed(2))
    }

    case "shopping": {
      // Weight-based material calculations
      if (details?.material && details?.weight) {
        const materialKey = details.material as keyof typeof SHOPPING_MATERIAL_FACTORS
        if (materialKey in SHOPPING_MATERIAL_FACTORS) {
          const factor = SHOPPING_MATERIAL_FACTORS[materialKey]
          return Number((details.weight * factor).toFixed(2))
        }
      }
      // Fallback to subcategory per item count
      const baseFactor = EMISSION_FACTORS.shopping[subcategory as ShoppingSubcategory] || 0.5
      return Number((amount * baseFactor).toFixed(2))
    }

    case "sustainable_action": {
      if (subcategory === "tree_planted") {
        const treeType = (details?.tree_type as keyof typeof TREE_SEQUESTRATION) || "deciduous"
        const sequestrationFactor = TREE_SEQUESTRATION[treeType] || -22.0
        return Math.abs(Number((amount * sequestrationFactor).toFixed(2)))
      }

      // Check for detailed recycling weight
      if (subcategory === "recycling" && details?.recycling_type && details?.weight) {
        const recyclingType = details.recycling_type as keyof typeof RECYCLING_SAVE_FACTORS
        if (recyclingType in RECYCLING_SAVE_FACTORS) {
          const factor = RECYCLING_SAVE_FACTORS[recyclingType]
          return Math.abs(Number((details.weight * factor).toFixed(2)))
        }
      }

      // Fallback to subcategory
      const baseFactor = EMISSION_FACTORS.sustainable_action[subcategory as ActionSubcategory] || -0.5
      return Math.abs(Number((amount * baseFactor).toFixed(2)))
    }

    default: {
      console.warn(`Unknown emission category "${category}"`)
      return 0
    }
  }
}

/**
 * Calculates the user's new points total based on logged activity.
 */
export function updateUserPoints(
  currentPoints: number,
  category: EmissionCategory,
  subcategory: string,
  amount: number
): number {
  let earnedPoints = 10 // 10 base points for logging

  if (category === "sustainable_action") {
    // Offset actions earn substantial points (e.g., 50 points per action unit)
    earnedPoints = 10 + (amount * 40)
  } else {
    // Low-carbon travel bonuses
    if (category === "travel" && (subcategory === "train" || subcategory === "bus" || subcategory === "car_electric")) {
      earnedPoints += 15
    }
    // Low-carbon meal bonuses
    if (category === "diet" && (subcategory === "vegan_meal" || subcategory === "vegetarian_meal")) {
      earnedPoints += 10
    }
  }

  return currentPoints + Math.round(earnedPoints)
}

/**
 * Calculates the updated streak count based on the user's last activity date.
 * 
 * @param lastActiveDateStr ISO timestamp of the user's last activity
 * @param currentStreak User's current streak value
 * @returns The updated streak count (either incremented, maintained, or reset to 1)
 */
export function updateStreak(
  lastActiveDateStr: string | null,
  currentStreak: number
): number {
  if (!lastActiveDateStr) {
    return 1
  }

  const now = new Date()
  const lastActive = new Date(lastActiveDateStr)

  // Strip time to calculate difference in calendar days
  const nowDate = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const lastActiveDate = Date.UTC(
    lastActive.getFullYear(),
    lastActive.getMonth(),
    lastActive.getDate()
  )

  const msPerDay = 24 * 60 * 60 * 1000
  const daysDiff = Math.floor((nowDate - lastActiveDate) / msPerDay)

  if (daysDiff === 0) {
    // Already logged today, maintain streak
    return currentStreak
  } else if (daysDiff === 1) {
    // Logged yesterday, consecutive day, increment streak
    return currentStreak + 1
  } else {
    // Missed a day or more, reset streak to 1
    return 1
  }
}
