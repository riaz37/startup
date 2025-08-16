"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { CheckCircle, AlertCircle, Key, Loader2 } from "lucide-react"
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth"
import { authApi } from "@/lib/auth/auth-api"


export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [tokenError, setTokenError] = useState("")
  const token = searchParams.get("token")

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: ""
    }
  })

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or missing reset token")
    }
  }, [token])

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true)

    try {
      await authApi.resetPassword({
        token: token || "",
        password: data.password
      })

      setSuccess(true)
      toast.success("Password reset successfully!")
      
      setTimeout(() => {
        router.push("/auth/signin?message=Password reset successfully")
      }, 3000)
    } catch (error: unknown) {
      // Error handling is done by the axios interceptor
      const errorMessage = error.response?.data?.error || "Failed to reset password"
      console.error("Reset password error:", errorMessage)
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
            <Button
              onClick={() => router.push("/auth/forgot-password")}
              className="w-full"
            >
              Request New Reset Link
            </Button>
            
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

          <Button
            onClick={() => router.push("/auth/signin")}
            className="w-full"
          >
            Continue to Sign In
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  New Password <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  Must contain at least 8 characters with uppercase, lowercase, number, and special character.
                </p>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !form.watch("password")}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Key className="mr-2 h-4 w-4" />
            )}
            Reset Password
          </Button>

          <div className="text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Remember your password? Sign in
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}