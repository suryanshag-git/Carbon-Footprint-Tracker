export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Green Leaderboard</h1>
        <p className="text-muted-foreground">Compare your points and streaks with the rest of the community.</p>
      </div>

      {/* Leaderboard table will be mounted here */}
      <div className="border border-dashed rounded-xl p-8 bg-card flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Leaderboard rankings loading...</p>
      </div>
    </div>
  )
}
