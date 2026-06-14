export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Eco Dashboard</h1>
        <p className="text-muted-foreground">Monitor and reduce your daily carbon footprint.</p>
      </div>
      
      {/* Dashboard statistics components will be mounted here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        <div className="p-6 bg-card border rounded-xl shadow-sm">
          <h3 className="font-semibold text-muted-foreground">Total Emissions</h3>
          <p className="text-2xl font-bold mt-2">-- kg CO₂</p>
        </div>
        <div className="p-6 bg-card border rounded-xl shadow-sm">
          <h3 className="font-semibold text-muted-foreground">Eco Points</h3>
          <p className="text-2xl font-bold mt-2">-- pts</p>
        </div>
      </div>
    </div>
  )
}
