import Link from "next/link"

export default function TrackHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Log Carbon Activity</h1>
        <p className="text-muted-foreground">Select a category below to record your footprint or offsets.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/track/travel" className="block p-6 bg-card border rounded-xl hover:border-emerald-500 transition-colors">
          <h2 className="text-xl font-semibold text-emerald-700">🚗 Travel</h2>
          <p className="text-muted-foreground mt-1">Cars, flights, public transit, etc.</p>
        </Link>
        <Link href="/track/diet" className="block p-6 bg-card border rounded-xl hover:border-emerald-500 transition-colors">
          <h2 className="text-xl font-semibold text-emerald-700">🍔 Diet</h2>
          <p className="text-muted-foreground mt-1">Meals, meat servings, dairy consumption.</p>
        </Link>
        <Link href="/track/energy" className="block p-6 bg-card border rounded-xl hover:border-emerald-500 transition-colors">
          <h2 className="text-xl font-semibold text-emerald-700">⚡ Energy</h2>
          <p className="text-muted-foreground mt-1">Electricity, gas, heating oil, water usage.</p>
        </Link>
        <Link href="/track/shopping" className="block p-6 bg-card border rounded-xl hover:border-emerald-500 transition-colors">
          <h2 className="text-xl font-semibold text-emerald-700">🛍️ Shopping</h2>
          <p className="text-muted-foreground mt-1">Clothing, electronics, furniture spend.</p>
        </Link>
        <Link href="/track/actions" className="block p-6 bg-card border rounded-xl hover:border-emerald-500 transition-colors">
          <h2 className="text-xl font-semibold text-emerald-700">🌱 Green Actions</h2>
          <p className="text-muted-foreground mt-1">Composting, recycling, tree planting.</p>
        </Link>
      </div>
    </div>
  )
}
