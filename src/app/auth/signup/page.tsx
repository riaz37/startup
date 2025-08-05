"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { LoadingButton } from "@/components/auth/loading-button"
import { toast } from "sonner"
import { CheckCircle, Mail } from "lucide-react"
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth"

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema)
  })

  const watchedFields = watch()

  const onSubmit = async (data: SignUpInput) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong")
      }

      setSuccess(true)
      toast.success("Account created successfully!")
      
      setTimeout(() => {
        router.push("/auth/signin?message=Account created successfully")
      }, 3000)
    } catch (error: any) {
      setError(error.message)
      toast.error("Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Account Created!"
        subtitle="Check your email to verify your account"
        showBackToHome={false}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <p className="text-muted-foreground">
              We've sent a verification email to your inbox. Please check your email and click the verification link to activate your account.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Check your email (including spam folder)</span>
            </div>
          </div>

          <div className="space-y-3">
            <LoadingButton
              onClick={() => router.push("/auth/signin")}
              className="w-full"
            >
              Continue to Sign In
            </LoadingButton>
            
            <p className="text-xs text-muted-foreground">
              Didn't receive the email?{" "}
              <Link
                href="/auth/resend-verification"
                className="text-primary hover:text-primary/80 font-medium"
              >
                Resend verification email
              </Link>
            </p>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Join Sohozdaam"
      subtitle="Create your account and start saving on group orders"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name <span className="text-destructive">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 placeholder:text-muted-foreground"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

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
            autoComplete="new-password"
            placeholder="Create a strong password"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 placeholder:text-muted-foreground"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Must contain at least 8 characters with uppercase, lowercase, number, and special character.
          </p>
        </div>

        <LoadingButton
          type="submit"
          loading={isLoading}
          className="w-full"
          disabled={!watchedFields.name || !watchedFields.email || !watchedFields.password}
        >
          Create Account
        </LoadingButton>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  )
}