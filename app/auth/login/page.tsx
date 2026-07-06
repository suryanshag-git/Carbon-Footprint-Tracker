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
import { loginAction } from "@/app/auth/actions"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginValues) {
    setIsLoading(true)
    const result = await loginAction(values)
    setIsLoading(false)

    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Welcome back! Logging you in...")
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50/30 to-green-50/50 p-4 dark:from-emerald-950/20 dark:via-background dark:to-background">
      <Card className="w-full max-w-md border-emerald-100/50 shadow-xl shadow-emerald-950/5 dark:border-emerald-950/30 dark:shadow-none">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2 text-3xl">🌱</div>
          <CardTitle className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
            Welcome to Bhoomija
          </CardTitle>
          <CardDescription>
            Enter your credentials to manage your carbon footprint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 border-t p-6 text-sm text-muted-foreground dark:border-emerald-950/30">
          <span>Don&apos;t have an account?</span>
          <Link
            href="/auth/signup"
            className="font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
