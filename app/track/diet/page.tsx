import ActivityForm from "@/components/track/activity-form"

export default function TrackDietPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Track Diet Footprint</h1>
        <p className="text-muted-foreground">Select your dietary meals and calculate their environmental impact.</p>
      </div>

      <ActivityForm
        category="diet"
        title="Log Diet Footprint"
        description="Choose meal types and enter servings or weight in kilograms."
      />
    </div>
  )
}
