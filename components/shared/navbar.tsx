"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlusCircle, MessageSquare, Trophy, User, ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavbarProps {
  isCollapsed: boolean
  setIsCollapsed: (val: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (val: boolean) => void
}

export default function Navbar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: NavbarProps) {
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
      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 hidden border-r bg-card md:flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16 p-4 items-center" : "w-64 p-6"
      )}>
        {/* Brand / Top Header */}
        <div className={cn(
          "flex items-center justify-between w-full mb-6 h-8",
          isCollapsed ? "justify-center" : ""
        )}>
          {!isCollapsed && (
            <div className="flex items-center space-x-2 overflow-hidden">
              <span className="text-2xl flex-shrink-0">🌱</span>
              <span className="text-xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400 whitespace-nowrap font-semibold">Bhoomija</span>
            </div>
          )}
          {isCollapsed && (
            <span className="text-2xl select-none">🌱</span>
          )}

          {/* Desktop Collapse Button */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground hidden md:block transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 w-full">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full",
                  isCollapsed ? "justify-center px-0 py-3" : "space-x-3",
                  isActive
                    ? "bg-emerald-50 text-emerald-950 dark:bg-emerald-950/35 dark:text-emerald-200"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={cn("size-5 flex-shrink-0", isActive ? "text-emerald-700 dark:text-emerald-400" : "")} />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Expand button at bottom when collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors w-full flex justify-center"
            title="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </aside>

      {/* Mobile Drawer (Slide-out menu overlay) */}
      <div className={cn(
        "fixed inset-0 z-40 md:hidden bg-background/80 backdrop-blur-sm transition-opacity duration-300",
        isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )} onClick={() => setIsMobileOpen(false)}>
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r p-6 flex flex-col space-y-6 transition-transform duration-300 ease-in-out",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking drawer content
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌱</span>
              <span className="text-xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Bhoomija</span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname?.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
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
      </div>

      {/* Mobile Bottom Navigation */}
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
