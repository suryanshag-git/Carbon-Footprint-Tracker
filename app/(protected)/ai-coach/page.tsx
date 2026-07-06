import ChatInterface from "@/components/ai-coach/chat-interface"

export default function AICoachPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">Gemini Eco-Coach</h1>
        <p className="text-muted-foreground">Ask questions and receive personalized sustainability tips based on your logs.</p>
      </div>

      <ChatInterface />
    </div>
  )
}
