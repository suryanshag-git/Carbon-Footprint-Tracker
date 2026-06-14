"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TravelForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Log travel commute</CardTitle>
        <CardDescription>Enter start and end location to calculate route distance automatically.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Google maps routing inputs placeholder */}
        <p className="text-sm text-muted-foreground">Google Maps Autocomplete & Distance Matrix will integrate here.</p>
      </CardContent>
    </Card>
  )
}
