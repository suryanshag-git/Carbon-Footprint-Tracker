"use server"

import { createClient } from "@/lib/supabase/server"

/**
 * Log in a user with email and password using Supabase Auth.
 */
export async function loginAction(data: { email: string; password: string }) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Sign up a new user and store additional user details (username, full name)
 * in the user metadata. The database trigger will automatically transfer this
 * metadata into the public profiles table.
 */
export async function signupAction(data: {
  email: string
  password: string
  username: string
  fullName?: string
}) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        username: data.username.trim(),
        full_name: data.fullName?.trim() || null,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Log out the current user and clear Supabase Auth cookies.
 */
export async function logoutAction() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
