import { GoogleGenerativeAI } from "@google/generative-ai"
import { Activity } from "@/types"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set.")
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

/**
 * Returns a configured model instance.
 * Defaults to 'gemini-2.5-flash' for general performance and cost efficiency.
 */
export function getGeminiModel(modelName = "gemini-2.5-flash") {
  if (!genAI) {
    throw new Error("Gemini AI is not initialized. Please verify GEMINI_API_KEY is configured.")
  }
  return genAI.getGenerativeModel({ model: modelName })
}

/**
 * Formats a personalized system prompt containing the user's specific carbon footprint history.
 */
export function buildEcoCoachSystemPrompt(
  username: string,
  points: number,
  streak: number,
  activities: Activity[]
): string {
  // Aggregate recent activities to pass as structured text to Gemini
  let activitySummary = "No activities logged in the past 30 days yet."
  
  if (activities && activities.length > 0) {
    const categoriesMap: Record<string, { count: number; totalCO2: number }> = {}
    
    activities.forEach((act) => {
      const cat = act.category
      const co2 = Number(act.co2_emission)
      
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { count: 0, totalCO2: 0 }
      }
      categoriesMap[cat].count += 1
      categoriesMap[cat].totalCO2 += co2
    })

    const summaryLines = Object.entries(categoriesMap).map(([cat, stats]) => {
      const label = cat.replace("_", " ")
      const actionVerb = cat === "sustainable_action" ? "offset saving" : "emissions"
      return `- ${label}: Logged ${stats.count} times. Total ${actionVerb}: ${stats.totalCO2.toFixed(1)} kg CO₂e.`
    })

    activitySummary = summaryLines.join("\n")
  }

  return `
You are "Eco Mitra", an empathetic, expert climate scientist and lifestyle sustainability advisor for the Jagrati app.
Your goal is to guide the user, @${username}, toward a lower carbon lifestyle using their actual activity history.

User Profile:
- Username: @${username}
- Current Eco Points: ${points} pts
- Logging Streak: ${streak} days

User's Activity Summary (Past 30 Days):
${activitySummary}

Guidelines:
1. Be encouraging, warm, and highly constructive. Do not make the user feel guilty.
2. Directly reference their actual activity logs in your tips. For example, if they have high travel emissions, suggest realistic public transit options. If they logged green actions (like tree planting), congratulate them!
3. Deliver highly actionable, specific, and realistic lifestyle changes.
4. Keep responses concise and structured. Use bullet points and bold text where appropriate.
5. Answer in standard Markdown.
`
}
