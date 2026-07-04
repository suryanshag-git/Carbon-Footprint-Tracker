"use client"

import React, { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Loader2, Sparkles, User, MessageSquare, Image, X } from "lucide-react"
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

const getAgentLabel = (name: string) => {
  switch (name) {
    case "coordinator":
      return "Eco-Coach Orchestrator"
    case "logging_agent":
      return "Logging Agent 📝"
    case "vision_agent":
      return "Vision Agent 👁️"
    case "analytics_agent":
      return "Analytics Agent 📊"
    case "goal_planner_agent":
      return "Goal Planner Agent 🎯"
    default:
      return name
  }
}

export default function ChatInterface() {
  const supabase = createClient()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  
  // Agentic systems states
  const [isAgenticMode, setIsAgenticMode] = useState(true)
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  
  // Image uploader states
  const [image, setImage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Fetch initial chat history
  useEffect(() => {
    async function loadChatHistory() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: convs } = await supabase
        .from("ai_conversations")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (convs && convs.length > 0) {
        const activeConvId = convs[0].id
        setConversationId(activeConvId)

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

  // 3. Handle image uploads
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast.error("Image must be smaller than 4MB.")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setImage(base64)
        setImagePreview(base64)
      }
      reader.readAsDataURL(file)
    }
  }

  // 4. Handle message submit
  async function sendMessage(textToSend: string) {
    if (!textToSend.trim() && !image) return
    if (isLoading) return

    const userMessage = textToSend.trim()
    setInput("")
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""

    // Format display string if image is present
    const displayMessage = userMessage || "Sent an image for analysis"
    setMessages((prev) => [...prev, { role: "user", content: displayMessage }])
    setIsLoading(true)
    setActiveAgent(isAgenticMode ? "coordinator" : null)

    try {
      const endpoint = isAgenticMode ? "/api/agents/chat" : "/api/ai/chat"
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage || "Analyze this image and log the activity.",
          conversationId,
          image: image || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to contact Eco-Coach API.")
      }

      const respConvId = response.headers.get("X-Conversation-ID")
      if (respConvId && respConvId !== conversationId) {
        setConversationId(respConvId)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let done = false
      let tempBuffer = ""
      let modelResponse = ""

      setMessages((prev) => [...prev, { role: "model", content: "" }])

      while (!done && reader) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        tempBuffer += chunkValue

        // If in agentic mode, parse metadata tags: [AGENT: name]
        if (isAgenticMode) {
          const agentMatch = tempBuffer.match(/\[AGENT:\s*([^\]]+)\]/g)
          if (agentMatch) {
            const lastTag = agentMatch[agentMatch.length - 1]
            const agentName = lastTag.match(/\[AGENT:\s*([^\]]+)\]/)?.[1]
            if (agentName) {
              setActiveAgent(agentName)
            }
            modelResponse = tempBuffer.replace(/\[AGENT:\s*[^\]]+\]/g, "")
          } else {
            modelResponse = tempBuffer
          }
        } else {
          modelResponse = tempBuffer
        }

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
      setActiveAgent(null)
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

        {/* Mode Selector Toggle */}
        <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setIsAgenticMode(false)}
            className={`px-2.5 py-1 rounded-md transition-all ${
              !isAgenticMode
                ? "bg-white text-emerald-800 font-medium shadow-sm dark:bg-emerald-950 dark:text-emerald-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setIsAgenticMode(true)}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              isAgenticMode
                ? "bg-white text-emerald-800 font-medium shadow-sm dark:bg-emerald-950 dark:text-emerald-300"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="size-3 text-amber-500 animate-pulse" />
            Agentic
          </button>
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
                  <div className="flex flex-col max-w-[80%]">
                    {/* Sub-agent Active Badge inside the message container */}
                    {isModel && index === messages.length - 1 && activeAgent && (
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mb-1 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md self-start border border-emerald-100/50 dark:border-emerald-900/30">
                        <span className="size-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        Active: {getAgentLabel(activeAgent)}
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                        isModel
                          ? "bg-muted text-foreground rounded-tl-none whitespace-pre-line"
                          : "bg-emerald-600 text-white rounded-tr-none"
                      }`}
                    >
                      {msg.content}
                    </div>
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
                <div className="flex flex-col">
                  {isAgenticMode && activeAgent && (
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mb-1 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md self-start border border-emerald-100/50 dark:border-emerald-900/30 animate-pulse">
                      <span className="size-1.5 bg-amber-500 rounded-full animate-bounce"></span>
                      Routing to: {getAgentLabel(activeAgent)}
                    </div>
                  )}
                  <div className="flex space-x-1 p-2.5 bg-muted rounded-2xl rounded-tl-none w-14 justify-center">
                    <span className="size-2 bg-muted-foreground/35 rounded-full animate-bounce"></span>
                    <span className="size-2 bg-muted-foreground/35 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="size-2 bg-muted-foreground/35 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      {/* Image Preview Area */}
      {imagePreview && (
        <div className="px-4 py-2.5 border-t border-emerald-50 dark:border-emerald-950/20 bg-muted/10 flex items-center gap-3">
          <div className="relative size-14 rounded-lg overflow-hidden border border-emerald-100 dark:border-emerald-900">
            <img src={imagePreview} alt="Upload preview" className="object-cover size-full" />
            <button
              type="button"
              onClick={() => {
                setImage(null)
                setImagePreview(null)
                if (fileInputRef.current) fileInputRef.current.value = ""
              }}
              className="absolute top-0 right-0 p-0.5 bg-black/60 hover:bg-black/80 text-white rounded-bl-lg transition-colors"
            >
              <X className="size-3" />
            </button>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-400">Image Attached</span>
            <span className="text-[10px] text-muted-foreground">Will be processed by the Vision Agent (gemini-2.5-pro)</span>
          </div>
        </div>
      )}

      {/* Input container */}
      <div className="p-3 bg-muted/20 border-t border-emerald-50 dark:border-emerald-950/20">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex items-center space-x-2"
        >
          {/* File Input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            id="chat-image-upload"
            disabled={isLoading || !isAgenticMode}
          />
          {isAgenticMode && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="border-emerald-100 dark:border-emerald-950/50 hover:bg-emerald-50/50 hover:text-emerald-700 text-muted-foreground"
              title="Upload image for Vision Agent analysis"
            >
              <Image className="h-4 w-4" />
            </Button>
          )}

          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isAgenticMode 
                ? "Ask details, log actions, or upload image..." 
                : "Ask your Eco-Coach..."
            }
            disabled={isLoading}
            className="flex-1 focus-visible:ring-emerald-500"
          />
          <Button
            type="submit"
            disabled={isLoading || (!input.trim() && !image)}
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
