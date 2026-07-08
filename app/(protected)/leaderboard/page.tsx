import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Flame, Award, Star } from "lucide-react"

export const revalidate = 0

export default async function LeaderboardPage() {
  const supabase = await createClient()

  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // 2. Fetch top 50 profiles by points
  const { data: leaderboard, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, points, streak")
    .order("points", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Leaderboard fetch error:", error)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Green Leaderboard</h1>
        <p className="text-muted-foreground">Compare your points and streaks with the rest of the community.</p>
      </div>

      <Card className="border-emerald-100 dark:border-emerald-950/40 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-lg">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <CardTitle>Global Rankings</CardTitle>
            <CardDescription>Top environmental champions in the Jagrati network</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th scope="col" className="px-6 py-3 text-center w-16">Rank</th>
                  <th scope="col" className="px-6 py-3">User</th>
                  <th scope="col" className="px-6 py-3 text-right">Active Streak</th>
                  <th scope="col" className="px-6 py-3 text-right">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leaderboard && leaderboard.length > 0 ? (
                  leaderboard.map((item, index) => {
                    const isCurrentUser = item.id === user.id
                    const rank = index + 1
                    
                    let rankDisplay: React.ReactNode = rank
                    if (rank === 1) rankDisplay = "🥇"
                    else if (rank === 2) rankDisplay = "🥈"
                    else if (rank === 3) rankDisplay = "🥉"

                    return (
                      <tr 
                        key={item.id} 
                        className={`transition-colors hover:bg-muted/10 ${
                          isCurrentUser 
                            ? "bg-emerald-50/45 dark:bg-emerald-950/15 border-l-4 border-l-emerald-600 font-medium" 
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-center font-bold text-base">
                          {rankDisplay}
                        </td>
                        <td className="px-6 py-4 flex items-center space-x-3">
                          <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center font-bold text-emerald-800 dark:text-emerald-400 text-xs">
                            {item.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-foreground">@{item.username}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full select-none">
                                  You
                                </span>
                              )}
                            </div>
                            {item.full_name && (
                              <div className="text-xs text-muted-foreground">{item.full_name}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold">
                            <Flame className="h-4 w-4 fill-orange-500 stroke-none" />
                            {item.streak} days
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                            <Star className="h-4 w-4 fill-amber-500 stroke-none" />
                            {item.points.toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No leaderboard listings available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
