"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, MapPin, Calculator } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { logActivityAction } from "@/app/track/actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const travelFormSchema = z.object({
  subcategory: z.string().min(1, "Please select transport mode."),
  method: z.enum(["manual", "maps"]),
  distance: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) > 0), {
      message: "Please enter a valid distance greater than 0.",
    }),
  origin: z.string().optional(),
  destination: z.string().optional(),
})

type TravelFormValues = z.infer<typeof travelFormSchema>

export default function TravelForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isCalculating, setIsCalculating] = React.useState(false)

  const form = useForm<TravelFormValues>({
    resolver: zodResolver(travelFormSchema),
    defaultValues: {
      subcategory: "",
      method: "manual",
      distance: "",
      origin: "",
      destination: "",
    },
  })

  const method = form.watch("method")

  // Simulated Google Maps Distance Calculation
  async function handleRouteCalculation() {
    const origin = form.getValues("origin")
    const destination = form.getValues("destination")

    if (!origin || !destination) {
      toast.error("Please enter both starting point and destination.")
      return
    }

    setIsCalculating(true)
    
    // Simulate API call to Google Maps Directions API
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // Generate a realistic random distance (10 - 45 km)
    const mockDistance = (Math.random() * 35 + 10).toFixed(1)
    
    form.setValue("distance", mockDistance)
    setIsCalculating(false)
    toast.success(`Route calculated! Distance: ${mockDistance} km.`)
  }

  async function onSubmit(values: TravelFormValues) {
    if (values.method === "manual" && !values.distance) {
      form.setError("distance", { message: "Distance is required for manual entry." })
      return
    }

    if (values.method === "maps" && !values.distance) {
      toast.error("Please calculate distance using the maps routing tool first.")
      return
    }

    setIsLoading(true)
    const result = await logActivityAction({
      category: "travel",
      subcategory: values.subcategory,
      amount: Number(values.distance),
      unit: "km",
      details: values.method === "maps" ? {
        method: "maps",
        origin: values.origin,
        destination: values.destination,
      } : { method: "manual" },
    })
    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else if (result?.success) {
      toast.success(`Logged! Travel Footprint: ${result.co2} kg CO₂e. Earned ${result.pointsEarned} points.`)

      if (result.badgesUnlocked && result.badgesUnlocked.length > 0) {
        result.badgesUnlocked.forEach((badge) => {
          toast.success(`🏆 Achievement Unlocked: ${badge}! Check your profile.`)
        })
      }

      form.reset({
        subcategory: "",
        method: "manual",
        distance: "",
        origin: "",
        destination: "",
      })

      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <Card className="border-emerald-100 dark:border-emerald-950/40">
      <CardHeader>
        <CardTitle className="text-emerald-800 dark:text-emerald-400">Commute Tracker</CardTitle>
        <CardDescription>Log your daily commutes, road trips, or flights.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode of Transport</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:bg-card dark:border-emerald-950/40"
                      {...field}
                    >
                      <option value="" disabled>Select vehicle type...</option>
                      <option value="car_petrol">Petrol Car</option>
                      <option value="car_diesel">Diesel Car</option>
                      <option value="car_electric">Electric Car</option>
                      <option value="motorbike">Motorbike</option>
                      <option value="bus">Public Bus</option>
                      <option value="train">Subway/Train</option>
                      <option value="flight_short">Short-haul Flight (<1500 km)</option>
                      <option value="flight_long">Long-haul Flight (>1500 km)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Logging Method</FormLabel>
                  <FormControl>
                    <Tabs
                      defaultValue={field.value}
                      onValueChange={(val) => {
                        field.onChange(val)
                        form.setValue("distance", "")
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg">
                        <TabsTrigger value="manual" className="rounded-md py-1 text-xs">Manual Entry</TabsTrigger>
                        <TabsTrigger value="maps" className="rounded-md py-1 text-xs">Google Maps Route</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="manual" className="pt-3 space-y-4">
                        <FormField
                          control={form.control}
                          name="distance"
                          render={({ field: distField }) => (
                            <FormItem>
                              <FormLabel>Distance (in km)</FormLabel>
                              <FormControl>
                                <div className="relative flex items-center">
                                  <Input
                                    type="number"
                                    placeholder="e.g. 25"
                                    className="focus-visible:ring-emerald-500"
                                    {...distField}
                                  />
                                  <span className="absolute right-3 text-xs font-semibold text-muted-foreground select-none">
                                    km
                                  </span>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      <TabsContent value="maps" className="pt-3 space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="origin"
                            render={({ field: orgField }) => (
                              <FormItem>
                                <FormLabel>Start Location</FormLabel>
                                <FormControl>
                                  <div className="relative flex items-center">
                                    <MapPin className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Origin address"
                                      className="pl-9 focus-visible:ring-emerald-500"
                                      {...orgField}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="destination"
                            render={({ field: destField }) => (
                              <FormItem>
                                <FormLabel>Destination Location</FormLabel>
                                <FormControl>
                                  <div className="relative flex items-center">
                                    <MapPin className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="Destination address"
                                      className="pl-9 focus-visible:ring-emerald-500"
                                      {...destField}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-emerald-600/35 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/50"
                          onClick={handleRouteCalculation}
                          disabled={isCalculating}
                        >
                          {isCalculating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Routing...
                            </>
                          ) : (
                            <>
                              <Calculator className="mr-2 h-4 w-4" />
                              Calculate Distance
                            </>
                          )}
                        </Button>

                        {form.watch("distance") && (
                          <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950/35 rounded-lg text-sm flex justify-between items-center">
                            <span className="font-medium text-emerald-800 dark:text-emerald-400">Total Calculated Distance:</span>
                            <span className="font-bold text-lg">{form.watch("distance")} km</span>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging Travel...
                </>
              ) : (
                "Log Travel"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
