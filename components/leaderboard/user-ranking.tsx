import React from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function UserRanking() {
  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-center text-sm font-semibold border-b pb-2">
          <span>Rank</span>
          <span>User</span>
          <span>Points</span>
          <span>Streak</span>
        </div>
        {/* Placeholder ranking rows */}
        <div className="text-center text-muted-foreground text-sm py-4">
          Community points rankings will load here.
        </div>
      </CardContent>
    </Card>
  )
}
