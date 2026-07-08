import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import PDFReportButton from "@/components/profile/pdf-report-button"
import EditProfileDialog from "@/components/profile/edit-profile-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/auth/actions"
import { LogOut, Award, Flame, Star, Trophy } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export const revalidate = 0

async function handleLogout() {
  "use server"
  await logoutAction()
  redirect("/auth/login")
}

export default async function ProfilePage() {
  const supabase = await createClient()

  // 1. Get user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // 2. Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const currentPoints = profile?.points || 0
  const currentStreak = profile?.streak || 0

  // 3. Fetch activities (past 30 days) for report
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", thirtyDaysAgo.toISOString())
    .order("logged_at", { ascending: false })

  // 4. Fetch total activities logged all-time
  const { count: totalActivities } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const activitiesCount = totalActivities || 0

  // 5. Fetch all master badges
  const { data: allBadges } = await supabase
    .from("badges")
    .select("*")
    .order("threshold", { ascending: true })

  // 6. Fetch user unlocked badges
  const { data: userBadges } = await supabase
    .from("user_badges")
    .select("awarded_at, badge_id")
    .eq("user_id", user.id)

  const unlockedBadgeMap = new Map<string, string>() // badge_id -> awarded_at
  userBadges?.forEach((ub) => {
    unlockedBadgeMap.set(ub.badge_id, ub.awarded_at)
  })

  // 7. Aggregate carbon emissions for report
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
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6">
        <div className="flex items-center space-x-4">
          <div className="size-16 rounded-full overflow-hidden border-2 border-emerald-500/20 bg-muted flex items-center justify-center shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="size-full object-cover" />
            ) : (
              <div className="text-2xl text-emerald-800 font-bold">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : profile?.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
              {profile?.full_name || "Eco Warrior"}
            </h1>
            <p className="text-muted-foreground text-sm">
              @{profile?.username} &bull; Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "--"}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <PDFReportButton
            username={profile?.username || "user"}
            points={currentPoints}
            streak={currentStreak}
            totalCO2={netTotalCO2}
            breakdown={breakdownData}
            recentActivities={activities || []}
          />

          <EditProfileDialog
            currentUsername={profile?.username || ""}
            currentFullName={profile?.full_name || ""}
            currentAvatarUrl={profile?.avatar_url || null}
          />
          
          <form action={handleLogout}>
            <Button type="submit" variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>

      {/* User Stats Card row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-emerald-100 dark:border-emerald-950/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Logs</CardTitle>
            <Star className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activitiesCount} logs</div>
            <p className="text-xs text-muted-foreground mt-1">Activities registered in Jagrati</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 dark:border-emerald-950/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accumulated Points</CardTitle>
            <Star className="h-4 w-4 text-amber-500 fill-amber-500 stroke-none" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentPoints} pts</div>
            <p className="text-xs text-muted-foreground mt-1">Level up by logging actions</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 dark:border-emerald-950/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Streak</CardTitle>
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500 stroke-none" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} Days</div>
            <p className="text-xs text-muted-foreground mt-1">Log activities daily to maintain</p>
          </CardContent>
        </Card>
      </div>

      {/* Gamified Badges Showcase */}
      <Card className="border-emerald-100 dark:border-emerald-950/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
            <Award className="h-5 w-5 text-emerald-600" />
            Achievements Showcase
          </CardTitle>
          <CardDescription>Track completed and upcoming milestone badges below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allBadges && allBadges.map((badge) => {
              const unlockedAt = unlockedBadgeMap.get(badge.id)
              const isUnlocked = !!unlockedAt

              // Calculate progress for locked items
              let progress = 0
              let progressText = ""

              if (badge.category === "points") {
                progress = Math.min((currentPoints / badge.threshold) * 100, 100)
                progressText = `${currentPoints} / ${badge.threshold} pts`
              } else if (badge.category === "streak") {
                progress = Math.min((currentStreak / badge.threshold) * 100, 100)
                progressText = `${currentStreak} / ${badge.threshold} days`
              } else if (badge.category === "activity") {
                progress = Math.min((activitiesCount / badge.threshold) * 100, 100)
                progressText = `${activitiesCount} / ${badge.threshold} logs`
              }

              return (
                <div
                  key={badge.id}
                  className={`flex flex-col justify-between p-4 border rounded-xl transition-all ${
                    isUnlocked
                      ? "bg-emerald-50/15 border-emerald-500/30 dark:bg-emerald-950/5 dark:border-emerald-900/50"
                      : "bg-muted/10 border-border opacity-70"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-2xl p-2 rounded-lg ${isUnlocked ? "bg-emerald-100 dark:bg-emerald-950/45 text-emerald-800" : "bg-muted/80 text-muted-foreground grayscale"}`}>
                      🏆
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm ${isUnlocked ? "text-emerald-800 dark:text-emerald-400" : "text-muted-foreground"}`}>
                        {badge.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{badge.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-dashed border-border/80">
                    {isUnlocked ? (
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/10 dark:bg-emerald-500/5 p-1 px-2 rounded-full text-center">
                        Unlocked on {new Date(unlockedAt).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Progress</span>
                          <span>{progressText}</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-muted-foreground/10" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
