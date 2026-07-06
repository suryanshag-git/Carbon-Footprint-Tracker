/**
 * Centralized CO2 emission factors for Bhoomija.
 * Values represent kilograms of CO2 equivalent (kg CO2e) per unit.
 * 
 * Sources: IPCC, US EPA, UK DEFRA, World Bank, and standard carbon accounting registries.
 */

// 1. Regional and Grid Specific Factors
export const REGIONAL_GRID_EMISSIONS = {
  IN: { // India - Default (Higher reliance on fossil fuels / coal in grid)
    electricity: 0.82,     // kg CO2e per kWh
    water: 0.0004,         // kg CO2e per liter
    name: "India"
  },
  US: { // United States
    electricity: 0.38,     // kg CO2e per kWh
    water: 0.0003,         // kg CO2e per liter
    name: "United States"
  },
  EU: { // Europe (Grid average)
    electricity: 0.25,     // kg CO2e per kWh
    water: 0.0002,         // kg CO2e per liter
    name: "Europe"
  },
  GLOBAL: { // Global Average
    electricity: 0.47,     // kg CO2e per kWh
    water: 0.0003,         // kg CO2e per liter
    name: "Global Average"
  }
} as const;

export type RegionCode = keyof typeof REGIONAL_GRID_EMISSIONS;

// 2. Travel Modifiers
export const FLIGHT_CLASS_MULTIPLIERS = {
  economy: 1.0,
  premium_economy: 1.6,
  business: 2.9,
  first: 4.0
} as const;

export const FUEL_LITER_CO2 = {
  petrol: 2.31,  // kg CO2e per liter
  diesel: 2.68,  // kg CO2e per liter
  lpg: 1.51      // kg CO2e per liter
} as const;

export const VEHICLE_SIZE_MULTIPLIERS = {
  small: 0.8,
  medium: 1.0,
  large: 1.3
} as const;

// 3. Detailed Diet Factors (per kg or serving)
export const DIET_FOOD_FACTORS = {
  beef: 27.0,           // kg CO2e per kg
  lamb: 39.0,           // kg CO2e per kg
  pork: 7.2,            // kg CO2e per kg
  chicken: 6.9,         // kg CO2e per kg
  fish: 5.4,            // kg CO2e per kg
  rice: 4.0,            // kg CO2e per kg
  wheat: 1.4,           // kg CO2e per kg
  milk: 1.9,            // kg CO2e per liter
  cheese: 13.5,         // kg CO2e per kg
  eggs: 4.8,            // kg CO2e per kg
  vegetables: 2.0       // kg CO2e per kg
} as const;

// 4. Detailed Energy Sources (per kWh generated)
export const ENERGY_SOURCE_CO2 = {
  coal: 0.95,
  gas: 0.45,
  solar: 0.04,
  wind: 0.01,
  hydro: 0.02,
  nuclear: 0.012
} as const;

// 5. Detailed Shopping Materials (per kg)
export const SHOPPING_MATERIAL_FACTORS = {
  cotton: 8.0,
  polyester: 18.0,
  wool: 14.0,
  leather: 110.0,
  silk: 25.0,
  paper: 0.9,
  plastic: 6.0,
  metal: 12.0
} as const;

// 6. Detailed Tree Sequestration (kg CO2e sequestered per tree per year)
export const TREE_SEQUESTRATION = {
  conifer: -15.0,
  deciduous: -22.0,
  tropical: -30.0
} as const;

// 7. Detailed Recycling Savings (kg CO2e saved per kg recycled)
export const RECYCLING_SAVE_FACTORS = {
  plastic: -1.5,
  paper: -1.0,
  glass: -0.3,
  metal: -4.0,
  organic: -0.2
} as const;

// Base Baseline factors for simple logging queries (Fallback values)
export const EMISSION_FACTORS = {
  travel: {
    // Unit: km (kilometers)
    car_petrol: 0.17,      // kg CO2e per km
    car_diesel: 0.16,
    car_electric: 0.05,    // depends on grid mix, average estimated
    motorbike: 0.11,
    bus: 0.03,            // per passenger-km
    train: 0.02,          // per passenger-km
    flight_short: 0.15,   // per passenger-km (< 1500 km)
    flight_long: 0.12,    // per passenger-km (> 1500 km)
  },
  diet: {
    // Unit: kg (kilograms) or serving
    beef: 27.0,           // kg CO2e per kg
    pork: 6.0,
    poultry: 4.5,
    fish: 3.5,
    dairy_milk: 1.9,      // per liter
    vegetarian_meal: 1.5, // average per meal serving
    vegan_meal: 0.8,      // average per meal serving
  },
  energy: {
    // Unit: kWh or liters
    electricity: 0.40,     // kg CO2e per kWh (US/global grid average)
    natural_gas: 0.18,     // kg CO2e per kWh
    heating_oil: 0.26,     // kg CO2e per kWh
    water: 0.0003,         // kg CO2e per liter
  },
  shopping: {
    // Unit: item count or spend
    clothing: 15.0,       // kg CO2e per item of clothing (average)
    electronics: 80.0,    // kg CO2e per consumer electronic device
    furniture: 50.0,      // kg CO2e per furniture item
    general_spend: 0.5,   // kg CO2e per USD spent (general retail average)
  },
  sustainable_action: {
    // Unit: action (negative values represent offsets or carbon saved)
    tree_planted: -22.0,   // kg CO2e sequestered per tree per year
    recycling: -0.5,       // kg CO2e saved per typical bag recycled
    composting: -0.2,      // kg CO2e saved per composting batch
    reusable_bag: -0.1,    // kg CO2e saved per use compared to plastic
    public_transport_day: -4.0, // average savings by substituting car commute for a day
  }
} as const;

export type EmissionCategory = keyof typeof EMISSION_FACTORS;

export type TravelSubcategory = keyof typeof EMISSION_FACTORS.travel;
export type DietSubcategory = keyof typeof EMISSION_FACTORS.diet;
export type EnergySubcategory = keyof typeof EMISSION_FACTORS.energy;
export type ShoppingSubcategory = keyof typeof EMISSION_FACTORS.shopping;
export type ActionSubcategory = keyof typeof EMISSION_FACTORS.sustainable_action;
