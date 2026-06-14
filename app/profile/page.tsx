import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PDFReportButton from "@/components/profile/pdf-report-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/auth/actions"
import { LogOut, Award, Flame, Star, ShieldAlert } from "lucide-react"

export const revalidate = 0

// Server Action trigger helper for log out in Server Components
async function handleLogout() {
  "use server"
  await logoutAction()
  redirect("/auth/login")
}

export default async function ProfilePage() {
  const supabase = await createClient()

  // 1. Get auth session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // 2. Fetch user profile details
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // 3. Fetch activities (past 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", thirtyDaysAgo.toISOString())
    .order("logged_at", { ascending: false })

  // 4. Fetch unlocked badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("awarded_at, badges(*)")
    .eq("user_id", user.id)

  // 5. Aggregate emissions for PDF report
  let travelCO2 = 0
  let dietCO2 = 0
  let energyCO2 = 0
  let shoppingCO2 = 0
  let offsetCO2 = 0

  if (activities) {
    activities.forEach((act) => {
      const co2 = Number(act.co2_emission)
      if (act.category === "sustainable_action") {
        offsetCO2 += co2
      } else {
        if (act.category === "travel") travelCO2 += co2
        else if (act.category === "diet") dietCO2 += co2
        else if (act.category === "energy") energyCO2 += co2
        else if (act.category === "shopping") shoppingCO2 += co2
      }
    })
  }

  const grossCO2 = travelCO2 + dietCO2 + energyCO2 + shoppingCO2
  const netTotalCO2 = Math.max(grossCO2 - offsetCO2, 0)

  const breakdownData = [
    { name: "Travel", value: travelCO2 },
    { name: "Diet", value: dietCO2 },
    { name: "Energy", value: energyCO2 },
    { name: "Shopping", value: shoppingCO2 },
    { name: "Offsets (Saved)", value: offsetCO2 },
  ]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">User Profile</h1>
          <p className="text-muted-foreground">Manage your credentials, achievements, and reports.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* PDF Report Export Button */}
          <PDFReportButton
            username={profile?.username || "user"}
            points={profile?.points || 0}
            streak={profile?.streak || 0}
            totalCO2={netTotalCO2}
            breakdown={breakdownData}
            recentActivities={activities || []}
          />
          
          <form action={handleLogout}>
            <Button type="submit" variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      {/* User Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-emerald-100 dark:border-emerald-950/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">User Handle</CardTitle>
            <span className="text-emerald-600">@</span>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-800 dark:text-emerald-400">
              @{profile?.username}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "--"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 dark:border-emerald-950/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accumulated Points</CardTitle>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.points || 0} pts</div>
            <p className="text-xs text-muted-foreground mt-1">Level up by logging actions</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 dark:border-emerald-950/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.streak || 0} Days</div>
            <p className="text-xs text-muted-foreground mt-1">Log activities daily to maintain</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Badges Card */}
      <Card className="border-emerald-100 dark:border-emerald-950/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <Award className="h-5 w-5 text-emerald-600" />
            Earned Badges
          </CardTitle>
          <CardDescription>Achievements unlocked through logging consistency and carbon saving.</CardDescription>
        </CardHeader>
        <CardContent>
          {userBadges && userBadges.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {userBadges.map((ub: any, idx) => {
                const badge = ub.badges
                return (
                  <div key={idx} className="flex items-start space-x-3 p-3 bg-muted/20 border border-muted/50 rounded-lg">
                    <div className="text-2xl p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded-md">
                      🏆
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-400">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{badge.description}</p>
                      <span className="inline-block text-[10px] text-muted-foreground bg-muted p-0.5 px-1.5 rounded mt-2">
                        Unlocked {new Date(ub.awarded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg bg-muted/5">
              <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
              No badges unlocked yet. Keep logging to earn achievements!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
