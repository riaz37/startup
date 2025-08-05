"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { LoadingButton } from "@/components/auth/loading-button"
import { toast } from "sonner"
import { CheckCircle, AlertCircle, Key } from "lucide-react"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenError, setTokenError] = useState("")
  const token = searchParams.get("token")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token || ""
    }
  })

  const watchedPassword = watch("password")

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or missing reset token")
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token: token,
          password: data.password
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong")
      }

      setSuccess(true)
      toast.success("Password reset successfully!")
      
      setTimeout(() => {
        router.push("/auth/signin?message=Password reset successfully")
      }, 3000)
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password")
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenError) {
    return (
      <AuthLayout
        title="Invalid Reset Link"
        subtitle="This password reset link is invalid or has expired"
        showBackToHome={false}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          
          <div className="space-y-2">
            <p className="text-muted-foreground">
              The password reset link you clicked is either invalid or has expired.
            </p>
            <p className="text-sm text-muted-foreground">
              Please request a new password reset link to continue.
            </p>
          </div>

          <div className="space-y-3">
            <LoadingButton
              onClick={() => router.push("/auth/forgot-password")}
              className="w-full"
            >
              Request New Reset Link
            </LoadingButton>
            
            <Link
              href="/auth/signin"
              className="block text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (success) {
    return (
      <AuthLayout
        title="Password Reset Complete"
        subtitle="Your password has been successfully updated"
        showBackToHome={false}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
          </div>

          <LoadingButton
            onClick={() => router.push("/auth/signin")}
            className="w-full"
          >
            Continue to Sign In
          </LoadingButton>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            New Password <span className="text-destructive">*</span>
          </label>
          <input
            {...register("password")}
            type="password"
            autoComplete="new-password"
            placeholder="Enter your new password"
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
          disabled={!watchedPassword}
        >
          <Key className="mr-2 h-4 w-4" />
          Reset Password
        </LoadingButton>

        <div className="text-center">
          <Link
            href="/auth/signin"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Remember your password? Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}