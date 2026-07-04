import { defineTool } from "@google/adk"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { logActivityAction } from "@/app/track/actions"
import { calculateCO2 } from "@/lib/calculations"
import { EmissionCategory } from "@/lib/emission_factors"

// 1. Tool to read current user profile
export const readProfileTool = defineTool({
  name: "read_profile",
  description: "Retrieve the logged-in user's sustainability profile, which includes username, current points, streak, last active timestamp, and awarded badges.",
  inputSchema: z.object({}),
  execute: async () => {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { error: "User is not authenticated. Please log in." }
      }

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError) {
        return { error: `Failed to fetch profile: ${profileError.message}` }
      }

      if (!profile) {
        return { error: "Profile not found." }
      }

      // Fetch badges
      const { data: badgesData, error: badgesError } = await supabase
        .from("user_badges")
        .select(`
          awarded_at,
          badges (
            id,
            name,
            description,
            icon_url,
            category
          )
        `)
        .eq("user_id", user.id)

      const badges = badgesError || !badgesData
        ? []
        : badgesData.map((b: any) => ({
            name: b.badges?.name,
            description: b.badges?.description,
            icon_url: b.badges?.icon_url,
            awarded_at: b.awarded_at
          }))

      return {
        username: profile.username,
        full_name: profile.full_name,
        points: profile.points,
        streak: profile.streak,
        last_active: profile.last_active,
        badges
      }
    } catch (err: any) {
      return { error: err.message || "An error occurred while fetching the profile." }
    }
  }
})

// 2. Tool to read user activities
export const readActivitiesTool = defineTool({
  name: "read_activities",
  description: "Retrieve a list of manual carbon tracking activities logged by the user, optionally filtered by category and limit.",
  inputSchema: z.object({
    category: z.enum(["travel", "diet", "shopping", "energy", "sustainable_action"]).optional().describe("Filter by emission category."),
    limit: z.number().optional().default(15).describe("Maximum number of activities to return.")
  }),
  execute: async ({ category, limit }) => {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { error: "User is not authenticated." }
      }

      let query = supabase
        .from("activities")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(limit)

      if (category) {
        query = query.eq("category", category)
      }

      const { data: activities, error } = await query

      if (error) {
        return { error: `Failed to fetch activities: ${error.message}` }
      }

      return activities || []
    } catch (err: any) {
      return { error: err.message || "An error occurred while fetching activities." }
    }
  }
})

// 3. Tool to log user activity
export const logActivityTool = defineTool({
  name: "log_activity",
  description: "Log a sustainability or carbon activity for the user (travel, diet, energy, shopping, or green action). This updates points, streak, and checks/awards badges.",
  inputSchema: z.object({
    category: z.enum(["travel", "diet", "shopping", "energy", "sustainable_action"]).describe("Emission category."),
    subcategory: z.string().describe("Subcategory type (e.g. car_petrol, flight_short, beef, electricity, tree_planted)."),
    amount: z.number().describe("Amount or quantity (e.g. distance in km, count of meals, kWh used, USD spent, actions)."),
    unit: z.string().describe("Unit (e.g. km, meals, kWh, usd, actions)."),
    details: z.object({}).optional().describe("Optional metadata object containing extra info (like start/end location).")
  }),
  execute: async ({ category, subcategory, amount, unit, details }) => {
    try {
      // Direct call to Next.js Server Action
      const result = await logActivityAction({
        category: category as EmissionCategory,
        subcategory,
        amount,
        unit,
        details: details || {}
      })

      if ("error" in result) {
        return { error: result.error }
      }

      return {
        success: true,
        co2_emission: result.co2,
        points_earned: result.pointsEarned,
        new_streak: result.newStreak,
        badges_unlocked: result.badgesUnlocked
      }
    } catch (err: any) {
      return { error: err.message || "An error occurred while logging the activity." }
    }
  }
})

// 4. Tool to manage sustainability goals
export const manageGoalsTool = defineTool({
  name: "manage_goals",
  description: "Manage personalized sustainability goals (list, create, update progress, or complete goals). status must be active, completed, or failed. targetDate should be an ISO string.",
  inputSchema: z.object({
    action: z.enum(["list", "create", "update_progress", "complete"]).describe("Action to perform."),
    goalId: z.string().optional().describe("Database UUID of the goal to update/complete."),
    title: z.string().optional().describe("Short title for the goal (e.g., 'Meat-Free Week')."),
    description: z.string().optional().describe("Details of what the goal is (e.g., 'Eat 5 vegetarian meals this week')."),
    targetValue: z.number().optional().describe("Numerical target to achieve."),
    currentValue: z.number().optional().describe("Current numerical progress value."),
    category: z.enum(["travel", "diet", "shopping", "energy", "sustainable_action"]).optional().describe("Activity category for the goal."),
    unit: z.string().optional().describe("Unit of measurement."),
    targetDate: z.string().optional().describe("ISO date string for target goal deadline."),
    status: z.enum(["active", "completed", "failed"]).optional().describe("Set goal status.")
  }),
  execute: async ({ action, goalId, title, description, targetValue, currentValue, category, unit, targetDate, status }) => {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return { error: "User is not authenticated." }
      }

      if (action === "list") {
        const { data: goals, error } = await supabase
          .from("sustainability_goals")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) return { error: `Failed to list goals: ${error.message}` }
        return goals || []
      }

      if (action === "create") {
        if (!title || !description || targetValue === undefined || !category || !unit || !targetDate) {
          return { error: "Missing required parameters for goal creation (title, description, targetValue, category, unit, targetDate)." }
        }

        const { data: goal, error } = await supabase
          .from("sustainability_goals")
          .insert({
            user_id: user.id,
            title,
            description,
            target_value: targetValue,
            current_value: currentValue || 0,
            category,
            unit,
            target_date: targetDate,
            status: status || "active"
          })
          .select("*")
          .single()

        if (error) return { error: `Failed to create goal: ${error.message}` }
        return { success: true, goal }
      }

      if (action === "update_progress") {
        if (!goalId || currentValue === undefined) {
          return { error: "goalId and currentValue are required to update progress." }
        }

        // Fetch current goal to see target
        const { data: currentGoal, error: fetchErr } = await supabase
          .from("sustainability_goals")
          .select("target_value, current_value")
          .eq("id", goalId)
          .eq("user_id", user.id)
          .single()

        if (fetchErr || !currentGoal) {
          return { error: `Goal not found or access denied: ${fetchErr?.message || ""}` }
        }

        const newStatus = currentValue >= currentGoal.target_value ? "completed" : "active"

        const { data: goal, error } = await supabase
          .from("sustainability_goals")
          .update({
            current_value: currentValue,
            status: newStatus
          })
          .eq("id", goalId)
          .eq("user_id", user.id)
          .select("*")
          .single()

        if (error) return { error: `Failed to update goal: ${error.message}` }
        return { success: true, goal }
      }

      if (action === "complete") {
        if (!goalId) return { error: "goalId is required to complete goal." }

        const { data: goal, error } = await supabase
          .from("sustainability_goals")
          .update({ status: "completed" })
          .eq("id", goalId)
          .eq("user_id", user.id)
          .select("*")
          .single()

        if (error) return { error: `Failed to complete goal: ${error.message}` }
        return { success: true, goal }
      }

      return { error: "Unknown goal action." }
    } catch (err: any) {
      return { error: err.message || "An error occurred while managing goals." }
    }
  }
})

// 5. Tool to get leaderboard
export const getLeaderboardTool = defineTool({
  name: "get_leaderboard",
  description: "Retrieve the top user rankings by points to see how the user compares globally.",
  inputSchema: z.object({
    limit: z.number().optional().default(10).describe("Number of entries to retrieve.")
  }),
  execute: async ({ limit }) => {
    try {
      const supabase = await createClient()
      const { data: rankings, error } = await supabase
        .from("profiles")
        .select("username, points, streak")
        .order("points", { ascending: false })
        .limit(limit)

      if (error) return { error: `Failed to fetch leaderboard: ${error.message}` }
      return rankings || []
    } catch (err: any) {
      return { error: err.message || "An error occurred while fetching leaderboard." }
    }
  }
})

// 6. Tool to calculate emission factors
export const calculateEmissionTool = defineTool({
  name: "calculate_emission",
  description: "Helper to calculate CO2 equivalent emissions in kg for a specific category, subcategory, and amount.",
  inputSchema: z.object({
    category: z.enum(["travel", "diet", "shopping", "energy", "sustainable_action"]).describe("Emission category."),
    subcategory: z.string().describe("Subcategory code (e.g. car_petrol, beef, electricity)."),
    amount: z.number().describe("Amount/quantity of activity.")
  }),
  execute: async ({ category, subcategory, amount }) => {
    try {
      const co2 = calculateCO2(category as EmissionCategory, subcategory, amount)
      return { category, subcategory, amount, co2_kg: co2 }
    } catch (err: any) {
      return { error: err.message || "An error occurred while calculating emissions." }
    }
  }
})
