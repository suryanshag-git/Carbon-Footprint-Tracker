import ActivityForm from "@/components/track/activity-form"

export default function TrackEnergyPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Track Household Energy</h1>
        <p className="text-muted-foreground">Monitor utility logs to convert power and water usage into carbon outputs.</p>
      </div>

      <ActivityForm
        category="energy"
        title="Log Utility Usage"
        description="Log electricity, gas, oil, or water amounts as recorded in your statements."
      />
    </div>
  )
}
