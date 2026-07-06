import TravelForm from "@/components/track/travel-form"

export default function TrackTravelPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Track Travel Emissions</h1>
        <p className="text-muted-foreground">Calculate the impact of your daily commute or flights.</p>
      </div>

      <TravelForm />
    </div>
  )
}
