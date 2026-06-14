export default function AICoachPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Gemini Eco-Coach</h1>
        <p className="text-muted-foreground">Receive personalized carbon insights, advice, and tips based on your activity logs.</p>
      </div>
      
      {/* AI Chat interface component will be mounted here */}
      <div className="h-[500px] border border-dashed rounded-xl flex items-center justify-center bg-card">
        <p className="text-muted-foreground">AI chat interface loading...</p>
      </div>
    </div>
  )
}
