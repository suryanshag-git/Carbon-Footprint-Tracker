import ActivityForm from "@/components/track/activity-form"

export default function TrackActionsPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Log Sustainable Actions</h1>
        <p className="text-muted-foreground">Log your green achievements, tree plantings, or offsets.</p>
      </div>

      <ActivityForm
        category="sustainable_action"
        title="Log Carbon Offsets"
        description="Choose green habits to deduct from emissions and score bonus points."
      />
    </div>
  )
}
