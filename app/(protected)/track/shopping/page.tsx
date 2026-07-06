import ActivityForm from "@/components/track/activity-form"

export default function TrackShoppingPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Track Shopping Emissions</h1>
        <p className="text-muted-foreground">Estimate carbon equivalents generated during consumer manufacturing.</p>
      </div>

      <ActivityForm
        category="shopping"
        title="Log Shopping Purchases"
        description="Select goods purchased or enter general expenditures in USD."
      />
    </div>
  )
}
