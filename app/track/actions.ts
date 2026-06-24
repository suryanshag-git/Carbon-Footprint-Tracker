"use server"

import { createClient } from "@/lib/supabase/server"
import { calculateCO2, updateUserPoints, updateStreak } from "@/lib/calculations"
import { EmissionCategory } from "@/lib/emission_factors"

interface LogActivityInput {
  category: EmissionCategory
  subcategory: string
  amount: number
  unit: string
  details?: Record<string, any>
}

/**
 * Server action to log an eco-activity.
 * Calculates emissions, points, updates streaks, and checks/awards badges.
 */
export async function logActivityAction(data: LogActivityInput) {
  try {
    const supabase = await createClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: "You must be logged in to log activities." }
    }

    const userId = user.id

    // 2. Get current profile stats (points, streak, last_active)
    let profile = null
    const { data: fetchedProfile, error: profileError } = await supabase
      .from("profiles")
      .select("points, streak, last_active")
      .eq("id", userId)
      .maybeSingle()

    if (profileError) {
      console.warn("Non-fatal error retrieving user profile, attempting fallback creation:", profileError.message)
    }

    if (!fetchedProfile) {
      // Profile does not exist (e.g., auth trigger bypass or race condition)
      // Generate a unique fallback username
      const randomSuffix = Math.random().toString(36).substring(2, 7)
      const cleanEmailPrefix = user.email 
        ? user.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").substring(0, 12) 
        : "user"
      const fallbackUsername = `eco_${cleanEmailPrefix}_${randomSuffix}`

      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          username: fallbackUsername,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          points: 100, // starter points
          streak: 0,
          last_active: new Date().toISOString(),
        })
        .select("points, streak, last_active")
        .single()

      if (createError) {
        return { 
          error: `User profile is missing and fallback creation failed: ${createError.message}. Details: ${createError.details || "none"}` 
        }
      }
      profile = newProfile
    } else {
      profile = fetchedProfile
    }

    // 3. Compute stats
    const co2Emission = calculateCO2(data.category, data.subcategory, data.amount)
    const newPoints = updateUserPoints(profile.points, data.category, data.subcategory, data.amount)
    
    // Update streak based on the last active time
    const newStreak = updateStreak(profile.last_active, profile.streak)
    
    const pointsEarned = newPoints - profile.points

    // 4. Save the activity log
    const { error: insertError } = await supabase
      .from("activities")
      .insert({
        user_id: userId,
        category: data.category,
        subcategory: data.subcategory,
        amount: data.amount,
        unit: data.unit,
        co2_emission: co2Emission,
        details: data.details || {},
      })

    if (insertError) {
      return { error: `Failed to save activity: ${insertError.message}` }
    }

    // 5. Update user profile stats
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        points: newPoints,
        streak: newStreak,
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateProfileError) {
      return { error: `Failed to update user profile stats: ${updateProfileError.message}` }
    }

    // 6. Check and award new badges
    const newlyUnlockedBadges: string[] = []

    // Fetch all master badges
    const { data: allBadges } = await supabase
      .from("badges")
      .select("*")

    // Fetch already unlocked badges
    const { data: unlockedBadges } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId)

    const ownedBadgeIds = new Set(unlockedBadges?.map(ub => ub.badge_id) || [])

    if (allBadges) {
      for (const badge of allBadges) {
        if (ownedBadgeIds.has(badge.id)) continue

        let qualifies = false

        if (badge.category === "points" && newPoints >= badge.threshold) {
          qualifies = true
        } else if (badge.category === "streak" && newStreak >= badge.threshold) {
          qualifies = true
        } else if (badge.category === "activity") {
          // Check how many activities have been logged in total
          const { count } = await supabase
            .from("activities")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)

          if (count && count >= badge.threshold) {
            qualifies = true
          }
        }

        if (qualifies) {
          // Award badge in database
          const { error: badgeAwardError } = await supabase
            .from("user_badges")
            .insert({
              user_id: userId,
              badge_id: badge.id
            })

          if (!badgeAwardError) {
            newlyUnlockedBadges.push(badge.name)
          }
        }
      }
    }

    return {
      success: true,
      co2: co2Emission,
      pointsEarned,
      newStreak,
      badgesUnlocked: newlyUnlockedBadges,
    }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." }
  }
}
