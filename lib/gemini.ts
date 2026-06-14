import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set.")
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

/**
 * Returns a configured model instance.
 * Defaults to 'gemini-1.5-flash' for general performance and cost efficiency.
 */
export function getGeminiModel(modelName = "gemini-1.5-flash") {
  if (!genAI) {
    throw new Error("Gemini AI is not initialized. Please verify GEMINI_API_KEY is configured.")
  }
  return genAI.getGenerativeModel({ model: modelName })
}
