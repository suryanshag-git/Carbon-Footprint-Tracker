import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SummaryProps {
  totalCO2: number
  points: number
  streak: number
}

export default function EmissionSummary({ totalCO2, points, streak }: SummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Emissions</CardTitle>
          <span className="text-xl">💨</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCO2.toFixed(1)} kg CO₂e</div>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Eco Points</CardTitle>
          <span className="text-xl">✨</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{points} pts</div>
          <p className="text-xs text-muted-foreground mt-1">+100 starting bonus included</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Logging Streak</CardTitle>
          <span className="text-xl">🔥</span>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{streak} Days</div>
          <p className="text-xs text-muted-foreground mt-1">Keep it up to earn badges!</p>
        </CardContent>
      </Card>
    </div>
  )
}
