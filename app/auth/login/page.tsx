import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold">Login to EcoTrack</h1>
      <p className="text-muted-foreground mt-2">Track your carbon footprint and make a difference.</p>
      {/* Login form placeholder */}
      <div className="mt-4">
        <Link href="/auth/signup" className="text-primary hover:underline">
          Don't have an account? Sign up
        </Link>
      </div>
    </div>
  )
}
