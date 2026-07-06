"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface ProfileUpdateData {
  username: string
  fullName: string
  avatarUrl: string | null
}

/**
 * Server Action to update the user's profile details and profile picture (avatar).
 */
export async function updateProfileAction(data: ProfileUpdateData) {
  try {
    const supabase = await createClient()

    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: "Unauthorized" }
    }

    const usernameClean = data.username.trim().toLowerCase()
    if (!usernameClean || usernameClean.length < 3) {
      return { error: "Username must be at least 3 characters." }
    }

    // 2. Verify username uniqueness
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", usernameClean)
      .neq("id", user.id)
      .maybeSingle()

    if (existingUser) {
      return { error: "Username is already taken." }
    }

    // 3. Perform database update
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: usernameClean,
        full_name: data.fullName.trim(),
        avatar_url: data.avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)

    if (updateError) {
      return { error: `Failed to update profile: ${updateError.message}` }
    }

    // 4. Force Next.js revalidation
    revalidatePath("/profile")
    revalidatePath("/dashboard")
    revalidatePath("/leaderboard")

    return { success: true }
  } catch (err: any) {
    return { error: err.message || "An unexpected error occurred." }
  }
}
