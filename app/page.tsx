import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Leaf, Sparkles, MapPin, Trophy, BarChart3, ShieldCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50/60 via-background to-background dark:from-emerald-950/15 dark:via-background dark:to-background text-foreground font-sans">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-emerald-100/40 bg-background/80 backdrop-blur-md dark:border-emerald-950/20">
        <div className="flex h-16 max-w-7xl mx-auto items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2">
            <span className="text-2xl select-none">🌱</span>
            <span className="text-xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Jagrati</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 hover:bg-emerald-50/50">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/60 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 w-fit mx-auto lg:mx-0">
                <Sparkles className="h-3 w-3 animate-pulse text-emerald-600 dark:text-emerald-400" />
                <span>Next-Generation Carbon Tracking</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50 leading-[1.1]">
                Track, Offset, and Reduce Your <span className="text-emerald-600 dark:text-emerald-400">Carbon Footprint</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                Empower your path to net-zero with Jagrati. Log travel commutes, dietary choices, energy bills, and shopping. Leverage personalized recommendations from Gemini AI to shrink your footprints.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/auth/signup" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base py-6 px-8 shadow-md">
                    Start Tracking Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/login" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto border-emerald-600/35 text-emerald-800 dark:text-emerald-400 py-6 px-8 hover:bg-emerald-50/50">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Image Column */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[420px] aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-100/30 to-teal-50/30 p-4 border border-emerald-100/50 shadow-2xl dark:shadow-none dark:border-emerald-950/20">
                <Image
                  src="/hero_eco.png"
                  alt="Eco Planet Illustration"
                  fill
                  priority
                  className="object-contain p-2 hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section className="bg-emerald-50/30 dark:bg-emerald-950/5 border-t border-b border-emerald-100/30 dark:border-emerald-950/20 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">
                Designed for Active Carbon Reduction
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Jagrati merges daily logging, route tracking, rewards, and cognitive AI to simplify environmental stewardship.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Card 1 */}
              <div className="p-6 bg-card border border-emerald-100/50 dark:border-emerald-950/35 rounded-2xl flex flex-col space-y-3 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-900 transition-colors">
                <div className="p-3 bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 rounded-xl w-fit">
                  <Leaf className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-400">Multi-Category Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  Log emissions across travel modes, dietary meals, household energy utility logs, and shopping receipts.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-6 bg-card border border-emerald-100/50 dark:border-emerald-950/35 rounded-2xl flex flex-col space-y-3 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-900 transition-colors">
                <div className="p-3 bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 rounded-xl w-fit">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-400">Gemini AI Coaching</h3>
                <p className="text-sm text-muted-foreground">
                  Receive streaming, personalized sustainability reports and daily lifestyle advice derived from your actual logging history.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 bg-card border border-emerald-100/50 dark:border-emerald-950/35 rounded-2xl flex flex-col space-y-3 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-900 transition-colors">
                <div className="p-3 bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 rounded-xl w-fit">
                  <Trophy className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-400">Gamification & Badges</h3>
                <p className="text-sm text-muted-foreground">
                  Build streaks, accumulate points, unlock badges, and test your standings in the public community leaderboard.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-6 bg-card border border-emerald-100/50 dark:border-emerald-950/35 rounded-2xl flex flex-col space-y-3 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-900 transition-colors">
                <div className="p-3 bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 rounded-xl w-fit">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-400">Google Maps Routing</h3>
                <p className="text-sm text-muted-foreground">
                  Plan routes to calculate actual road travel distance automatically and convert it to precise emission weights.
                </p>
              </div>

              {/* Card 5 */}
              <div className="p-6 bg-card border border-emerald-100/50 dark:border-emerald-950/35 rounded-2xl flex flex-col space-y-3 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-900 transition-colors">
                <div className="p-3 bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 rounded-xl w-fit">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-400">Recharts Aggregates</h3>
                <p className="text-sm text-muted-foreground">
                  Inspect emission breakdowns via interactive Pie Charts and visualize 30-day timeline trends using Area Charts.
                </p>
              </div>

              {/* Card 6 */}
              <div className="p-6 bg-card border border-emerald-100/50 dark:border-emerald-950/35 rounded-2xl flex flex-col space-y-3 shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-900 transition-colors">
                <div className="p-3 bg-emerald-100/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 rounded-xl w-fit">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-400">Offset Verification</h3>
                <p className="text-sm text-muted-foreground">
                  Offset footprints by recording green habits (tree planting, recycling, composting) that deduct from gross emissions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100/40 dark:border-emerald-950/20 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Jagrati Inc. Towards a Net-Zero Future. All rights reserved.</p>
      </footer>
    </div>
  )
}
