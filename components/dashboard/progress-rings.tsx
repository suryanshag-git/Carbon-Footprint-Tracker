import React from "react"

interface ProgressRingsProps {
  value: number // Current daily emissions
  limit: number // Target daily limit (e.g., 10 kg)
}

export default function ProgressRings({ value, limit }: ProgressRingsProps) {
  const percentage = Math.min((value / limit) * 100, 100)
  
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-card border rounded-xl shadow-sm">
      <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 text-sm mb-4">Daily CO₂ Limit</h3>
      <div className="relative size-36">
        {/* SVG Ring */}
        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            className="stroke-muted fill-none"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            className="stroke-emerald-600 fill-none transition-all duration-500 ease-out"
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (251.2 * percentage) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold">{value.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">of {limit} kg</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center">
        {percentage >= 100 ? "Limit exceeded. Log offset actions!" : `${(100 - percentage).toFixed(0)}% remaining budget`}
      </p>
    </div>
  )
}
