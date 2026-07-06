import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EmissionSummary from "@/components/dashboard/emission-summary"
import ProgressRings from "@/components/dashboard/progress-rings"
import EmissionCharts from "@/components/dashboard/emission-charts"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

  // Fetch active/completed goals
  const { data: goals } = await supabase
    .from("sustainability_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3) // Show top 3 recent goals

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

      {/* Active Sustainability Goals & Challenges Section */}
      <div className="grid gap-6">
        <Card className="border-emerald-100 dark:border-emerald-950/40 shadow-sm bg-card">
          <CardHeader className="pb-3 border-b border-emerald-50 dark:border-emerald-950/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-emerald-800 dark:text-emerald-400">Sustainability Goals & Weekly Challenges</CardTitle>
                <CardDescription className="text-xs">Personalized challenges generated by your AI Goal Planner.</CardDescription>
              </div>
              <Link href="/ai-coach">
                <Button variant="outline" className="border-emerald-600/35 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50/50 text-xs py-1 h-8">
                  Get New Challenge
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!goals || goals.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-muted-foreground">You don't have any active goals yet.</p>
                <Link href="/ai-coach">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
                    Chat with Eco Mitra to start
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => {
                  const percent = Math.min(Math.round((Number(goal.current_value) / Number(goal.target_value)) * 100), 100)
                  const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  const categoryLabel = goal.category.replace("_", " ")

                  return (
                    <div key={goal.id} className="p-4 rounded-xl border border-emerald-50 dark:border-emerald-950/50 bg-muted/20 hover:shadow-sm transition-all flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            {categoryLabel}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            goal.status === "completed" 
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
                              : daysLeft < 2 
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }`}>
                            {goal.status === "completed" ? "Completed" : `${daysLeft > 0 ? `${daysLeft}d left` : "Ended"}`}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-foreground">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Progress</span>
                          <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                            {goal.current_value} / {goal.target_value} {goal.unit}
                          </span>
                        </div>
                        <div className="w-full bg-emerald-100/30 dark:bg-emerald-950/30 h-2 rounded-full overflow-hidden border border-emerald-100/10">
                          <div 
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
