import { EMISSION_FACTORS, EmissionCategory } from "./emission_factors"

/**
 * Calculates CO2 equivalent emissions in kg.
 * 
 * @param category The main category of activity ('travel', 'diet', etc.)
 * @param subcategory The specific subcategory (e.g. 'car_petrol', 'beef')
 * @param amount The numerical amount (e.g. km traveled, kg food, kWh)
 * @returns The calculated CO2 equivalent emissions in kg.
 */
export function calculateEmissions(
  category: EmissionCategory,
  subcategory: string,
  amount: number
): number {
  if (amount < 0) return 0;

  const categoryFactors = EMISSION_FACTORS[category];
  
  if (subcategory in categoryFactors) {
    const factor = (categoryFactors as Record<string, number>)[subcategory];
    return Number((amount * factor).toFixed(2));
  }

  console.warn(`No emission factor found for subcategory "${subcategory}" in category "${category}"`);
  return 0;
}

/**
 * Helper to calculate points awarded for logging an activity.
 * Users get standard points for logging, and extra points for sustainable actions.
 */
export function calculatePoints(
  category: EmissionCategory,
  subcategory: string,
  amount: number
): number {
  let basePoints = 10; // 10 points for tracking anything

  if (category === "sustainable_action") {
    // Green actions earn 50 points per action
    return basePoints + (amount * 40);
  }

  // Award bonus points for low-emission travel choices
  if (category === "travel" && (subcategory === "train" || subcategory === "bus")) {
    basePoints += 15;
  }

  // Award bonus points for low-emission meals
  if (category === "diet" && (subcategory === "vegan_meal" || subcategory === "vegetarian_meal")) {
    basePoints += 10;
  }

  return basePoints;
}
