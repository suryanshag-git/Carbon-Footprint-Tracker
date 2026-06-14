export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">User Profile</h1>
        <p className="text-muted-foreground">View your streaks, badges, points, and export your monthly footprint report.</p>
      </div>

      {/* Badges list and PDF report export will be mounted here */}
      <div className="border border-dashed rounded-xl p-8 bg-card flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Achievements and report tools loading...</p>
      </div>
    </div>
  )
}
