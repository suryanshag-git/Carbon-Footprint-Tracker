/**
 * Centralized CO2 emission factors for EcoTrack.
 * Values represent kilograms of CO2 equivalent (kg CO2e) per unit.
 * 
 * Sources: IPCC, EPA, DEFRA, and standard carbon accounting data.
 */
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
