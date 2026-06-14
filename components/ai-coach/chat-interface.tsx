"use client"

import React, { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Sparkles, User, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface Message {
  role: "user" | "model"
  content: string
}

const STARTER_CHIPS = [
  "How can I reduce my car emissions?",
  "Suggest a low-carbon vegetarian meal.",
  "How much carbon does planting a tree save?",
  "Tips for lowering my home electricity bill.",
]

export default function ChatInterface() {
  const supabase = createClient()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Fetch initial chat history
  useEffect(() => {
    async function loadChatHistory() {
      // Get current user session
      const { data: { user } } = await supabase.auth.getSession()
      if (!user) return

      // Fetch latest conversation
      const { data: convs } = await supabase
        .from("ai_conversations")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (convs && convs.length > 0) {
        const activeConvId = convs[0].id
        setConversationId(activeConvId)

        // Fetch messages for conversation
        const { data: msgs } = await supabase
          .from("ai_messages")
          .select("role, content")
          .eq("conversation_id", activeConvId)
          .order("created_at", { ascending: true })

        if (msgs) {
          setMessages(
            msgs.map((m) => ({
              role: m.role as "user" | "model",
              content: m.content,
            }))
          )
        }
      }
    }

    loadChatHistory()
  }, [supabase])

  // 2. Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 3. Handle message submit
  async function sendMessage(textToSend: string) {
    if (!textToSend.trim() || isLoading) return

    const userMessage = textToSend.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to contact Eco-Coach API.")
      }

      // Check header for conversation ID (in case a new one was created)
      const respConvId = response.headers.get("X-Conversation-ID")
      if (respConvId && respConvId !== conversationId) {
        setConversationId(respConvId)
      }

      // Web Stream reader parsing
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let done = false
      let modelResponse = ""

      // Append an empty AI response bubble
      setMessages((prev) => [...prev, { role: "model", content: "" }])

      while (!done && reader) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        modelResponse += chunkValue

        // Update the last message item
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: "model",
            content: modelResponse,
          }
          return updated
        })
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-emerald-100 dark:border-emerald-950/40 flex flex-col h-[600px] shadow-sm bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-emerald-50 dark:border-emerald-950/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 rounded-lg">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <CardTitle className="text-lg text-emerald-800 dark:text-emerald-400">Eco-Coach Chat</CardTitle>
            <CardDescription className="text-xs">Streaming carbon advisory powered by Gemini AI</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      {/* Messages viewport */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <MessageSquare className="h-10 w-10 text-muted-foreground/45" />
            <div>
              <h4 className="font-semibold text-sm">Ask your Eco-Coach</h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                Your coach has access to your points, streaks, and logging history to deliver custom suggestions.
              </p>
            </div>
            {/* Starter chips */}
            <div className="grid gap-2 grid-cols-2 max-w-md w-full pt-4">
              {STARTER_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(chip)}
                  className="text-left text-xs p-2.5 rounded-lg border border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all dark:border-emerald-950/45 dark:hover:border-emerald-900"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isModel = msg.role === "model"
              return (
                <div
                  key={index}
                  className={`flex ${isModel ? "justify-start" : "justify-end"} items-start gap-2.5`}
                >
                  {isModel && (
                    <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950/35 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                      isModel
                        ? "bg-muted text-foreground rounded-tl-none whitespace-pre-line"
                        : "bg-emerald-600 text-white rounded-tr-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {!isModel && (
                    <div className="size-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              )
            })}
            
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start items-center gap-2.5">
                <div className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-950/35 flex items-center justify-center text-emerald-800">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex space-x-1 p-2.5 bg-muted rounded-2xl rounded-tl-none">
                  <span className="size-2 bg-muted-foreground/35 rounded-full animate-bounce"></span>
                  <span className="size-2 bg-muted-foreground/35 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="size-2 bg-muted-foreground/35 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      {/* Input container */}
      <div className="p-3 bg-muted/20 border-t border-emerald-50 dark:border-emerald-950/20">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex items-center space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your Eco-Coach..."
            disabled={isLoading}
            className="flex-1 focus-visible:ring-emerald-500"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  )
}
