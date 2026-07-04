import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getOrCreateAgentRunner } from "@/lib/agents/runner"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, conversationId, image } = await request.json()
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // 2. Resolve or create AI Conversation ID
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

    // 3. Save User Message to Database
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

    // 4. Fetch previous message history (past 15 messages for context limit)
    const { data: history } = await supabase
      .from("ai_messages")
      .select("role, content, created_at")
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true })
      .limit(15)

    const dbHistory = (history || []).map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("model" as const),
      content: msg.content,
      created_at: msg.created_at,
    }))

    // 5. Initialize the Agent Runner with history
    const runner = await getOrCreateAgentRunner(user.id, currentConversationId, dbHistory)

    // 6. Build the newMessage payload parts
    const parts: any[] = [{ text: message }]

    if (image) {
      const mimeTypeMatch = image.match(/^data:(image\/[a-zA-Z0-9.-]+);base64,/)
      if (mimeTypeMatch) {
        const mimeType = mimeTypeMatch[1]
        const base64Data = image.replace(/^data:image\/[a-zA-Z0-9.-]+;base64,/, "")
        parts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        })
      }
    }

    // 7. Execute ADK runner runAsync
    const events = runner.runAsync({
      userId: user.id,
      sessionId: currentConversationId,
      newMessage: {
        role: "user",
        parts,
      },
    })

    // 8. Stream events back to the client using Web Stream API
    const textEncoder = new TextEncoder()
    let modelResponseText = ""
    let lastAuthor = ""

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of events) {
            // Stream metadata about active sub-agent if the author changes
            if (event.author && event.author !== "user" && event.author !== lastAuthor) {
              lastAuthor = event.author
              controller.enqueue(textEncoder.encode(`[AGENT: ${event.author}]`))
            }

            // Stream standard text delta content
            if (event.content?.parts?.[0]?.text) {
              const chunkText = event.content.parts[0].text
              modelResponseText += chunkText
              controller.enqueue(textEncoder.encode(chunkText))
            }
          }

          // Stream completed, save model response to DB (without agent metadata tags)
          if (modelResponseText.trim()) {
            await supabase.from("ai_messages").insert({
              conversation_id: currentConversationId,
              role: "model",
              content: modelResponseText,
            })
          }

          controller.close()
        } catch (streamError) {
          console.error("Error during agent execution stream:", streamError)
          controller.error(streamError)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Conversation-ID": currentConversationId,
      },
    })

  } catch (error: any) {
    console.error("Agent chat route error:", error)
    return NextResponse.json({ error: error.message || "An error occurred." }, { status: 500 })
  }
}
