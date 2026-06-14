import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EmissionSummary from "@/components/dashboard/emission-summary"
import ProgressRings from "@/components/dashboard/progress-rings"
import EmissionCharts from "@/components/dashboard/emission-charts"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, PlusCircle } from "lucide-react"

export const revalidate = 0 // Disable cache to reflect logging updates instantly

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // 2. Fetch user profile stats
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // 3. Fetch user activities from the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", thirtyDaysAgo.toISOString())
    .order("logged_at", { ascending: true })

  // 4. Calculate aggregates
  let grossCO2 = 0
  let travelCO2 = 0
  let dietCO2 = 0
  let energyCO2 = 0
  let shoppingCO2 = 0
  let offsetCO2 = 0

  let todayNetCO2 = 0
  const todayStr = new Date().toISOString().split("T")[0]

  // Map to hold daily net emissions for the last 7 days timeline
  const dailyNetMap = new Map<string, number>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    dailyNetMap.set(dateStr, 0)
  }

  if (activities) {
    activities.forEach((act) => {
      const co2 = Number(act.co2_emission)
      const isOffset = act.category === "sustainable_action"
      const actDateStr = new Date(act.logged_at).toISOString().split("T")[0]

      if (isOffset) {
        offsetCO2 += co2
        
        if (actDateStr === todayStr) {
          todayNetCO2 -= co2
        }
        
        if (dailyNetMap.has(actDateStr)) {
          dailyNetMap.set(actDateStr, (dailyNetMap.get(actDateStr) || 0) - co2)
        }
      } else {
        grossCO2 += co2
        
        if (act.category === "travel") travelCO2 += co2
        else if (act.category === "diet") dietCO2 += co2
        else if (act.category === "energy") energyCO2 += co2
        else if (act.category === "shopping") shoppingCO2 += co2

        if (actDateStr === todayStr) {
          todayNetCO2 += co2
        }
        
        if (dailyNetMap.has(actDateStr)) {
          dailyNetMap.set(actDateStr, (dailyNetMap.get(actDateStr) || 0) + co2)
        }
      }
    })
  }

  const netTotalCO2 = Math.max(grossCO2 - offsetCO2, 0)
  const finalTodayNetCO2 = Math.max(todayNetCO2, 0)

  // 5. Structure Recharts dataset
  const breakdownData = [
    { name: "Travel", value: Number(travelCO2.toFixed(1)), color: "#10b981" },
    { name: "Diet", value: Number(dietCO2.toFixed(1)), color: "#f59e0b" },
    { name: "Energy", value: Number(energyCO2.toFixed(1)), color: "#3b82f6" },
    { name: "Shopping", value: Number(shoppingCO2.toFixed(1)), color: "#8b5cf6" },
  ]

  const timelineData = Array.from(dailyNetMap.entries()).map(([date, amount]) => {
    const [_, m, d] = date.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthIndex = parseInt(m) - 1
    const dateLabel = `${monthNames[monthIndex]} ${d}`

    return {
      date: dateLabel,
      amount: Math.max(Number(amount.toFixed(1)), 0), // Net emissions capped at 0 minimum
    }
  })

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Eco Dashboard</h1>
          <p className="text-muted-foreground">Monitor and offset your carbon footprints dynamically.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/profile">
            <Button variant="outline" className="border-emerald-600/35 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50/50">
              <FileText className="mr-2 h-4 w-4" />
              Reports & Profile
            </Button>
          </Link>
          <Link href="/track">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
              <PlusCircle className="mr-2 h-4 w-4" />
              Log Activity
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Aggregated Summary Row */}
      <EmissionSummary
        totalCO2={netTotalCO2}
        points={profile?.points || 0}
        streak={profile?.streak || 0}
      />

      {/* Analytics and Budget Rings */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EmissionCharts breakdown={breakdownData} timeline={timelineData} />
        </div>
        <div>
          {/* Daily limit cap set to 12.0 kg CO2 average budget allowance */}
          <ProgressRings value={finalTodayNetCO2} limit={12.0} />
        </div>
      </div>
    </div>
  )
}
