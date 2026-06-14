"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, MessageSquare, Trophy, User } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Track", href: "/track", icon: PlusCircle },
    { name: "Coach", href: "/ai-coach", icon: MessageSquare },
    { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { name: "Profile", href: "/profile", icon: User },
  ]

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r bg-card md:flex flex-col p-6 space-y-6">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🌱</span>
          <span className="text-xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">EcoTrack</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/35 dark:text-emerald-200"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("size-5", isActive ? "text-emerald-700 dark:text-emerald-400" : "")} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation (hidden on desktop) */}
      <nav className="fixed bottom-0 inset-x-0 z-20 border-t bg-card md:hidden h-16 flex items-center justify-around px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-0.5 text-center flex-1 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
              <span className="scale-90">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
