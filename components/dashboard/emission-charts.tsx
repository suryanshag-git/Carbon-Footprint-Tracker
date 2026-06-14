"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

interface EmissionChartsProps {
  breakdown: { name: string; value: number; color: string }[]
  timeline: { date: string; amount: number }[]
}

export default function EmissionCharts({ breakdown, timeline }: EmissionChartsProps) {
  const hasBreakdownData = breakdown.some((d) => d.value > 0)
  const hasTimelineData = timeline.length > 0

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Category breakdown (Pie Chart) */}
      <Card className="border-emerald-100/50 dark:border-emerald-950/40">
        <CardHeader>
          <CardTitle className="text-emerald-800 dark:text-emerald-400">Emission Sources</CardTitle>
          <CardDescription>Breakdown of carbon output by category (in kg CO₂e)</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center">
          {hasBreakdownData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown.filter((d) => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)} kg`, "Emissions"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground text-sm border border-dashed rounded-lg w-full h-full flex items-center justify-center bg-muted/5">
              No activity logs yet. Start tracking to see your carbon breakdown!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historical trends (Area Chart) */}
      <Card className="border-emerald-100/50 dark:border-emerald-950/40">
        <CardHeader>
          <CardTitle className="text-emerald-800 dark:text-emerald-400">Emissions Timeline</CardTitle>
          <CardDescription>Daily net carbon footprint trends (in kg CO₂e)</CardDescription>
        </CardHeader>
        <CardContent className="h-72 flex items-center justify-center">
          {hasTimelineData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs fill-muted-foreground"
                />
                <Tooltip
                  formatter={(value: number) => [`${value.toFixed(1)} kg`, "CO₂e"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEmissions)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-muted-foreground text-sm border border-dashed rounded-lg w-full h-full flex items-center justify-center bg-muted/5">
              Log activity daily to see your carbon timeline over time.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
