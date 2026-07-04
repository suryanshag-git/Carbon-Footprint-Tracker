import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getGeminiModel, buildEcoCoachSystemPrompt } from "@/lib/gemini"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, conversationId } = await request.json()
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // 2. Fetch user profile & activities
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", thirtyDaysAgo.toISOString())

    // 3. Resolve or create AI Conversation ID
    let currentConversationId = conversationId
    if (!currentConversationId) {
      // Find the user's latest conversation or create one
      const { data: latestConv } = await supabase
        .from("ai_conversations")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)

      if (latestConv && latestConv.length > 0) {
        currentConversationId = latestConv[0].id
      } else {
        const { data: newConv, error: newConvError } = await supabase
          .from("ai_conversations")
          .insert({
            user_id: user.id,
            title: message.substring(0, 30) + "...",
          })
          .select("id")
          .single()

        if (newConvError || !newConv) {
          return NextResponse.json({ error: "Failed to create conversation" }, { status: 500 })
        }
        currentConversationId = newConv.id
      }
    }

    // 4. Save User Message to Database
    const { error: userMsgError } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: currentConversationId,
        role: "user",
        content: message,
      })

    if (userMsgError) {
      console.error("Failed to save user message:", userMsgError)
    }

    // 5. Fetch previous message history (past 15 messages for context limit)
    const { data: history } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true })
      .limit(15)

    // Map database roles to Gemini roles ('user' -> 'user', 'model' -> 'model')
    const formattedHistory = (history || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // 6. Build the custom system prompt and fetch Gemini Model
    const systemInstruction = buildEcoCoachSystemPrompt(
      profile?.username || "user",
      profile?.points || 0,
      profile?.streak || 0,
      activities || []
    )

    const model = getGeminiModel() // Uses default 'gemini-2.5-flash'
    
    // Use generateContentStream
    const result = await model.generateContentStream({
      contents: formattedHistory,
      systemInstruction: systemInstruction,
    })

    // 7. Stream response chunks using Web Stream API
    const textEncoder = new TextEncoder()
    let modelResponseText = ""

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            modelResponseText += chunkText
            controller.enqueue(textEncoder.encode(chunkText))
          }
          
          // Stream completed, save model response to DB asynchronously
          await supabase.from("ai_messages").insert({
            conversation_id: currentConversationId,
            role: "model",
            content: modelResponseText,
          })

          controller.close()
        } catch (streamError) {
          console.error("Error during streaming:", streamError)
          controller.error(streamError)
        }
      },
    })

    // Return the response stream along with conversation ID in header for reference
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-ID": currentConversationId,
      },
    })

  } catch (error: any) {
    console.error("AI chat route error:", error)
    return NextResponse.json({ error: error.message || "An error occurred." }, { status: 500 })
  }
}
