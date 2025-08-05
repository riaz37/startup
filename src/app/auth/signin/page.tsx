"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { FormField } from "@/components/auth/form-field"
import { LoadingButton } from "@/components/auth/loading-button"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Chrome } from "lucide-react"
import { signInSchema, type SignInInput } from "@/lib/validations/auth"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema)
  })

  const watchedFields = watch()

  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false
      })

      if (result?.error) {
        if (result.error === "Account is deactivated") {
          setError("Your account has been deactivated. Please contact support.")
        } else {
          setError("Invalid email or password. Please try again.")
        }
        toast.error("Sign in failed")
      } else {
        toast.success("Welcome back!")
        
        // Refresh session to get updated user data
        const session = await getSession()
        
        // Redirect based on user role
        if (session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN") {
          router.push("/admin")
        } else {
          router.push(callbackUrl)
        }
        router.refresh()
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await signIn("google", { callbackUrl })
    } catch (error) {
      toast.error("Google sign in failed")
      setGoogleLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Sohozdaam account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email address <span className="text-destructive">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 placeholder:text-muted-foreground"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password <span className="text-destructive">*</span>
          </label>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 placeholder:text-muted-foreground"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <LoadingButton
          type="submit"
          loading={isLoading}
          className="w-full"
          disabled={!watchedFields.email || !watchedFields.password}
        >
          Sign in
        </LoadingButton>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading || googleLoading}
        >
          {googleLoading ? (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Chrome className="mr-2 h-4 w-4" />
          )}
          Continue with Google
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}