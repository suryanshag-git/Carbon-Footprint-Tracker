"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ActionItem() {
  return (
    <Card className="hover:border-emerald-600 transition-colors cursor-pointer">
      <CardHeader>
        <CardTitle className="text-lg">Sustainable actions catalog</CardTitle>
        <CardDescription>Click to instantly log offsets and earn eco points.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">List of actionable sustainable choices (recycling, composting, etc.) will render here.</p>
      </CardContent>
    </Card>
  )
}
