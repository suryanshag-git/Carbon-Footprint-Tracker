"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ActivityFormProps {
  category: string
  title: string
  description: string
}

export default function ActivityForm({ category, title, description }: ActivityFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dynamic form fields depending on category placeholder */}
        <p className="text-sm text-muted-foreground">Form fields for logging {category} activities will load here.</p>
      </CardContent>
    </Card>
  )
}
