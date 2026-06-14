"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ChatInterface() {
  return (
    <Card className="w-full h-full flex flex-col max-h-[600px]">
      <CardHeader>
        <CardTitle>Eco-Coach Chat</CardTitle>
        <CardDescription>Ask questions about how to reduce your carbon footprint, recycle better, or lower your energy bills.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4 border-t border-b">
        <p className="text-sm text-muted-foreground text-center">No messages yet. Say hello to start the coaching session.</p>
      </CardContent>
      {/* Chat input placeholder */}
      <div className="p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground">Chat input and streaming message indicators will render here.</p>
      </div>
    </Card>
  )
}
