"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, ChevronDown, ChevronUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { logActivityAction } from "@/app/(protected)/track/actions"
import { EmissionCategory } from "@/lib/emission_factors"

// Define categories sub-items and their units
const CATEGORY_CONFIG: Record<
  EmissionCategory,
  { subcategories: { value: string; label: string; unit: string }[] }
> = {
  travel: {
    subcategories: [
      { value: "car_petrol", label: "Commute by Petrol Car", unit: "km" },
      { value: "car_diesel", label: "Commute by Diesel Car", unit: "km" },
      { value: "car_electric", label: "Commute by Electric Car", unit: "km" },
      { value: "motorbike", label: "Motorbike Commute", unit: "km" },
      { value: "bus", label: "Bus Transit", unit: "km" },
      { value: "train", label: "Train Transit", unit: "km" },
      { value: "flight_short", label: "Short-haul Flight (< 1500km)", unit: "km" },
      { value: "flight_long", label: "Long-haul Flight (> 1500km)", unit: "km" },
    ],
  },
  diet: {
    subcategories: [
      { value: "beef", label: "Beef Consumption", unit: "kg" },
      { value: "pork", label: "Pork Consumption", unit: "kg" },
      { value: "poultry", label: "Poultry Consumption", unit: "kg" },
      { value: "fish", label: "Fish Consumption", unit: "kg" },
      { value: "dairy_milk", label: "Dairy Milk", unit: "liters" },
      { value: "vegetarian_meal", label: "Vegetarian Meals", unit: "meals" },
      { value: "vegan_meal", label: "Vegan Meals", unit: "meals" },
    ],
  },
  energy: {
    subcategories: [
      { value: "electricity", label: "Electricity Usage", unit: "kWh" },
      { value: "natural_gas", label: "Natural Gas Usage", unit: "kWh" },
      { value: "heating_oil", label: "Heating Oil Usage", unit: "kWh" },
      { value: "water", label: "Water Consumption", unit: "liters" },
    ],
  },
  shopping: {
    subcategories: [
      { value: "clothing", label: "New Clothing", unit: "items" },
      { value: "electronics", label: "New Electronics", unit: "items" },
      { value: "furniture", label: "New Furniture", unit: "items" },
      { value: "general_spend", label: "General Retail Purchases", unit: "USD" },
    ],
  },
  sustainable_action: {
    subcategories: [
      { value: "tree_planted", label: "Trees Planted", unit: "trees" },
      { value: "recycling", label: "Bags of Waste Recycled", unit: "bags" },
      { value: "composting", label: "Batches Composted", unit: "batches" },
      { value: "reusable_bag", label: "Reusable Bag Uses", unit: "uses" },
      { value: "public_transport_day", label: "Days Replacing Car with Public Transit", unit: "days" },
    ],
  },
}

const activitySchema = z.object({
  subcategory: z.string().min(1, "Please select an activity type."),
  amount: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Please enter a valid amount greater than 0.",
    }),
  notes: z.string().optional(),
  foodItem: z.string().optional(),
  material: z.string().optional(),
  weight: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Please enter a valid weight greater than 0.",
    }),
  treeType: z.string().optional(),
  recyclingType: z.string().optional(),
  coalPercent: z.string().optional(),
  gasPercent: z.string().optional(),
  solarPercent: z.string().optional(),
  windPercent: z.string().optional(),
  hydroPercent: z.string().optional(),
  nuclearPercent: z.string().optional(),
})

type ActivityValues = z.infer<typeof activitySchema>

interface ActivityFormProps {
  category: EmissionCategory
  title: string
  description: string
}

export default function ActivityForm({ category, title, description }: ActivityFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  
  const config = CATEGORY_CONFIG[category]

  const form = useForm<ActivityValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      subcategory: "",
      amount: "",
      notes: "",
      foodItem: "",
      material: "",
      weight: "",
      treeType: "",
      recyclingType: "",
      coalPercent: "",
      gasPercent: "",
      solarPercent: "",
      windPercent: "",
      hydroPercent: "",
      nuclearPercent: "",
    },
  })

  // Watch selected subcategory to display current unit dynamically
  const selectedSub = form.watch("subcategory")
  const currentUnit = config.subcategories.find(s => s.value === selectedSub)?.unit || ""

  const hasAdvanced = 
    category === "diet" || 
    category === "shopping" || 
    (category === "energy" && selectedSub === "electricity") || 
    (category === "sustainable_action" && (selectedSub === "tree_planted" || selectedSub === "recycling"))

  async function onSubmit(values: ActivityValues) {
    if (category === "shopping" && values.material && !values.weight) {
      form.setError("weight", { message: "Product weight is required when material is selected." })
      return
    }

    if (category === "sustainable_action" && values.subcategory === "recycling" && values.recyclingType && !values.weight) {
      form.setError("weight", { message: "Weight is required when recycling material type is selected." })
      return
    }

    if (category === "energy" && values.subcategory === "electricity") {
      const coalVal = Number(values.coalPercent || 0)
      const gasVal = Number(values.gasPercent || 0)
      const solarVal = Number(values.solarPercent || 0)
      const windVal = Number(values.windPercent || 0)
      const hydroVal = Number(values.hydroPercent || 0)
      const nuclearVal = Number(values.nuclearPercent || 0)
      const sum = coalVal + gasVal + solarVal + windVal + hydroVal + nuclearVal
      
      if (sum > 0 && sum !== 100) {
        toast.error("Electricity source mix percentages must sum to exactly 100%.")
        return
      }
    }

    setIsLoading(true)

    const details: Record<string, any> = {
      notes: values.notes || undefined,
    }

    if (category === "diet") {
      if (values.foodItem) details.food_item = values.foodItem
    } else if (category === "energy" && values.subcategory === "electricity") {
      const coalVal = Number(values.coalPercent || 0)
      const gasVal = Number(values.gasPercent || 0)
      const solarVal = Number(values.solarPercent || 0)
      const windVal = Number(values.windPercent || 0)
      const hydroVal = Number(values.hydroPercent || 0)
      const nuclearVal = Number(values.nuclearPercent || 0)
      const sum = coalVal + gasVal + solarVal + windVal + hydroVal + nuclearVal
      
      if (sum === 100) {
        details.source_mix = {
          coal: coalVal,
          gas: gasVal,
          solar: solarVal,
          wind: windVal,
          hydro: hydroVal,
          nuclear: nuclearVal,
        }
      }
    } else if (category === "shopping") {
      if (values.material) details.material = values.material
      if (values.weight) details.weight = Number(values.weight)
    } else if (category === "sustainable_action") {
      if (values.subcategory === "tree_planted" && values.treeType) {
        details.tree_type = values.treeType
      } else if (values.subcategory === "recycling") {
        if (values.recyclingType) details.recycling_type = values.recyclingType
        if (values.weight) details.weight = Number(values.weight)
      }
    }

    const result = await logActivityAction({
      category,
      subcategory: values.subcategory,
      amount: Number(values.amount),
      unit: currentUnit,
      details,
    })
    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else if (result?.success) {
      const isOffset = category === "sustainable_action"
      
      // Notify emission totals
      if (isOffset) {
        toast.success(`Logged! Offset: ${Math.abs(result.co2!)} kg CO₂e saved. Earned ${result.pointsEarned} points.`)
      } else {
        toast.success(`Logged! Footprint: ${result.co2} kg CO₂e emitted. Earned ${result.pointsEarned} points.`)
      }

      // Notify badge achievement
      if (result.badgesUnlocked && result.badgesUnlocked.length > 0) {
        result.badgesUnlocked.forEach((badge) => {
          toast.success(`🏆 Achievement Unlocked: ${badge}! Check your profile.`, {
            duration: 5000,
          })
        })
      }

      form.reset({
        subcategory: "",
        amount: "",
        notes: "",
        foodItem: "",
        material: "",
        weight: "",
        treeType: "",
        recyclingType: "",
        coalPercent: "",
        gasPercent: "",
        solarPercent: "",
        windPercent: "",
        hydroPercent: "",
        nuclearPercent: "",
      })

      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <Card className="border-emerald-100 dark:border-emerald-950/40">
      <CardHeader>
        <CardTitle className="text-emerald-800 dark:text-emerald-400">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card dark:border-emerald-950/40"
                      {...field}
                    >
                      <option value="" disabled>Select subcategory...</option>
                      {config.subcategories.map((sub) => (
                        <option key={sub.value} value={sub.value}>
                          {sub.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount {currentUnit && `(in ${currentUnit})`}</FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Input
                        type="number"
                        step="any"
                        placeholder="e.g. 15"
                        className="focus-visible:ring-emerald-500 pr-16"
                        {...field}
                      />
                      {currentUnit && (
                        <span className="absolute right-3 text-xs font-semibold text-muted-foreground select-none">
                          {currentUnit}
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedSub && hasAdvanced && (
              <div className="border border-emerald-100/50 dark:border-emerald-950/20 rounded-lg p-4 bg-muted/20 space-y-4">
                <button
                  type="button"
                  className="flex items-center justify-between w-full text-sm font-semibold text-emerald-800 dark:text-emerald-400 hover:text-emerald-900"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <span>Advanced options (Optional)</span>
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {showAdvanced && (
                  <div className="pt-3 border-t border-emerald-100/30 dark:border-emerald-950/10 space-y-4 font-sans">
                    {category === "diet" && (
                      <FormField
                        control={form.control}
                        name="foodItem"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">Specific Food Item Override</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:bg-card dark:border-emerald-950/40"
                                {...field}
                              >
                                <option value="">Select specific food item...</option>
                                <option value="beef">Beef</option>
                                <option value="lamb">Lamb</option>
                                <option value="pork">Pork</option>
                                <option value="chicken">Chicken</option>
                                <option value="fish">Fish</option>
                                <option value="rice">Rice</option>
                                <option value="wheat">Wheat</option>
                                <option value="milk">Milk (Liters)</option>
                                <option value="cheese">Cheese</option>
                                <option value="eggs">Eggs</option>
                                <option value="vegetables">Vegetables</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {category === "energy" && selectedSub === "electricity" && (
                      <div className="space-y-3">
                        <FormLabel className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 block mb-1">
                          Electricity Grid Source Mix (Optional - Must sum to 100%)
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={form.control}
                            name="coalPercent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] text-muted-foreground font-medium">Coal (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" className="h-8 text-xs focus-visible:ring-emerald-500" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="gasPercent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] text-muted-foreground font-medium">Natural Gas (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" className="h-8 text-xs focus-visible:ring-emerald-500" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="solarPercent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] text-muted-foreground font-medium">Solar (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" className="h-8 text-xs focus-visible:ring-emerald-500" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="windPercent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] text-muted-foreground font-medium">Wind (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" className="h-8 text-xs focus-visible:ring-emerald-500" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="hydroPercent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] text-muted-foreground font-medium">Hydro (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" className="h-8 text-xs focus-visible:ring-emerald-500" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="nuclearPercent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] text-muted-foreground font-medium">Nuclear (%)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="0" className="h-8 text-xs focus-visible:ring-emerald-500" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {category === "shopping" && (
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="material"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium">Material Type Override</FormLabel>
                              <FormControl>
                                <select
                                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:bg-card dark:border-emerald-950/40"
                                  {...field}
                                >
                                  <option value="">Select material type...</option>
                                  <option value="cotton">Cotton</option>
                                  <option value="polyester">Polyester</option>
                                  <option value="wool">Wool</option>
                                  <option value="leather">Leather</option>
                                  <option value="silk">Silk</option>
                                  <option value="paper">Paper</option>
                                  <option value="plastic">Plastic</option>
                                  <option value="metal">Metal</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium">Weight of product (in kg)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="any"
                                  placeholder="e.g. 0.5"
                                  className="focus-visible:ring-emerald-500 h-9 text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {category === "sustainable_action" && selectedSub === "tree_planted" && (
                      <FormField
                        control={form.control}
                        name="treeType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium">Tree Species Type</FormLabel>
                            <FormControl>
                              <select
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:bg-card dark:border-emerald-950/40"
                                {...field}
                              >
                                <option value="">Select tree species...</option>
                                <option value="conifer">Conifer (Evergreen)</option>
                                <option value="deciduous">Deciduous</option>
                                <option value="tropical">Tropical</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {category === "sustainable_action" && selectedSub === "recycling" && (
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="recyclingType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium">Recycled Material Category</FormLabel>
                              <FormControl>
                                <select
                                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:bg-card dark:border-emerald-950/40"
                                  {...field}
                                >
                                  <option value="">Select material...</option>
                                  <option value="plastic">Plastic</option>
                                  <option value="paper">Paper</option>
                                  <option value="glass">Glass</option>
                                  <option value="metal">Metal</option>
                                  <option value="organic">Organic/Compost</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium">Recycled Weight (in kg)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="any"
                                  placeholder="e.g. 4.5"
                                  className="focus-visible:ring-emerald-500 h-9 text-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Weekly utility bill, commute to office"
                      className="focus-visible:ring-emerald-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging Activity...
                </>
              ) : (
                "Log Activity"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
