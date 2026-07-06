"use client"

import React, { useState } from "react"
import Navbar from "@/components/shared/navbar"
import { cn } from "@/lib/utils"
import { Menu } from "lucide-react"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Top Header */}
      <header className="flex md:hidden items-center justify-between px-4 h-16 border-b bg-card sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <span className="text-xl">🌱</span>
          <span className="font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Bhoomija</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </header>

      {/* Sidebar Navigation */}
      <Navbar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className={cn(
        "transition-all duration-300 ease-in-out pb-16 md:pb-0",
        isCollapsed ? "md:pl-16" : "md:pl-64"
      )}>
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
