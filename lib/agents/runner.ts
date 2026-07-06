import { InMemoryRunner } from "@google/adk"
import { rootAgent } from "./config"

interface DbMessage {
  role: "user" | "model"
  content: string
  created_at?: string
}

/**
 * Creates and initializes an InMemoryRunner session, seeding it with the conversation
 * history from Supabase if the runner session is new.
 * 
 * @param userId The authenticated Supabase user ID.
 * @param sessionId The conversation UUID from Supabase.
 * @param historyMessages The array of previous messages in this conversation.
 * @returns The initialized InMemoryRunner.
 */
export async function getOrCreateAgentRunner(
  userId: string,
  sessionId: string,
  historyMessages: DbMessage[] = []
): Promise<InMemoryRunner> {
  const runner = new InMemoryRunner({
    agent: rootAgent,
    appName: "Bhoomija"
  })

  // 1. Check if the session already exists in the runner's session service
  let session = await runner.sessionService.getSession({
    appName: runner.appName,
    userId,
    sessionId
  })

  // 2. If it does not exist, create it
  if (!session) {
    session = await runner.sessionService.createSession({
      appName: runner.appName,
      userId,
      sessionId
    })
  }

  // 3. Hydrate the session events if it is empty and we have historical database messages
  if (session && session.events.length === 0 && historyMessages.length > 0) {
    const historyEvents = historyMessages.map((msg, index) => {
      const isUser = msg.role === "user"
      return {
        id: `h-${index}-${Math.random().toString(36).substring(2, 6)}`,
        invocationId: `inv-${index}`,
        author: isUser ? "user" : "coordinator",
        timestamp: msg.created_at ? new Date(msg.created_at).getTime() : Date.now() - (historyMessages.length - index) * 1000,
        content: {
          role: isUser ? "user" : "model",
          parts: [{ text: msg.content }]
        },
        actions: {
          stateDelta: {},
          artifactDelta: {},
          requestedAuthConfigs: {},
          requestedToolConfirmations: {}
        }
      }
    })

    session.events.push(...historyEvents)

    // Sync it back into the in-memory runner sessions mapping
    const service = runner.sessionService as any
    if (service.sessions?.[runner.appName]?.[userId]?.[sessionId]) {
      service.sessions[runner.appName][userId][sessionId].events = session.events
    }
  }

  return runner
}
