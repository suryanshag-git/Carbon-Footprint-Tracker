import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">Sign up for EcoTrack</h1>
      <p className="text-muted-foreground mt-2">Join the green revolution and start tracking.</p>
      {/* Signup form placeholder */}
      <div className="mt-4">
        <Link href="/auth/login" className="text-primary hover:underline">
          Already have an account? Login
        </Link>
      </div>
    </div>
  )
}
