"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { logActivityAction } from "@/app/track/actions"
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
  
  const config = CATEGORY_CONFIG[category]

  const form = useForm<ActivityValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      subcategory: "",
      amount: "",
      notes: "",
    },
  })

  // Watch selected subcategory to display current unit dynamically
  const selectedSub = form.watch("subcategory")
  const currentUnit = config.subcategories.find(s => s.value === selectedSub)?.unit || ""

  async function onSubmit(values: ActivityValues) {
    setIsLoading(true)
    const result = await logActivityAction({
      category,
      subcategory: values.subcategory,
      amount: Number(values.amount),
      unit: currentUnit,
      details: values.notes ? { notes: values.notes } : {},
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
