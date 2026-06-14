"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { signupAction } from "@/app/auth/actions"

const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must not exceed 20 characters.")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores."),
  fullName: z.string().optional(),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

type SignupValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: SignupValues) {
    setIsLoading(true)
    const result = await signupAction(values)
    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Account created successfully! Check your email to verify.")
      router.push("/auth/login?registered=true")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50/30 to-green-50/50 p-4 dark:from-emerald-950/20 dark:via-background dark:to-background">
      <Card className="w-full max-w-md border-emerald-100/50 shadow-xl shadow-emerald-950/5 dark:border-emerald-950/30 dark:shadow-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2 text-3xl">🌱</div>
          <CardTitle className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
            Create an Account
          </CardTitle>
          <CardDescription>
            Join EcoTrack and begin your green journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="eco_warrior"
                        className="focus-visible:ring-emerald-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jane Doe"
                        className="focus-visible:ring-emerald-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        className="focus-visible:ring-emerald-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="focus-visible:ring-emerald-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 border-t p-6 text-sm text-muted-foreground dark:border-emerald-950/30">
          <span>Already have an account?</span>
          <Link
            href="/auth/login"
            className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
