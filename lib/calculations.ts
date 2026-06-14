import { EMISSION_FACTORS, EmissionCategory } from "./emission_factors"

/**
 * Calculates CO2 equivalent emissions in kg.
 * Sources: EPA Greenhouse Gas Equivalents, UK DEFRA GHG Factors.
 * 
 * @param category The main category of activity ('travel', 'diet', etc.)
 * @param subcategory The specific subcategory (e.g. 'car_petrol', 'beef')
 * @param amount The numerical amount (e.g. km traveled, kg food, kWh)
 * @returns The calculated CO2 equivalent emissions in kg.
 */
export function calculateCO2(
  category: EmissionCategory,
  subcategory: string,
  amount: number
): number {
  if (amount <= 0) return 0

  const categoryFactors = EMISSION_FACTORS[category]
  
  if (subcategory in categoryFactors) {
    const factor = (categoryFactors as Record<string, number>)[subcategory]
    return Number((amount * factor).toFixed(2))
  }

  console.warn(`No emission factor found for subcategory "${subcategory}" in category "${category}"`)
  return 0
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
