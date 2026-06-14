import React from "react"
import Navbar from "@/components/shared/navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 md:pl-64">
      {/* Sidebar for desktop / Navbar for mobile */}
      <Navbar />
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
