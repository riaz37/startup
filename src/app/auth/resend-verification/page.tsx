"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { LoadingButton } from "@/components/auth/loading-button"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Mail, ArrowLeft, CheckCircle } from "lucide-react"
import { z } from "zod"

const resendSchema = z.object({
  email: z.string().email("Invalid email address")
})

type ResendInput = z.infer<typeof resendSchema>

export default function ResendVerificationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ResendInput>({
    resolver: zodResolver(resendSchema)
  })

  const watchedEmail = watch("email")

  const onSubmit = async (data: ResendInput) => {
    setIsLoading(true)
    setEmail(data.email)

    try {
      const response = await fetch("/api/auth/resend-verification", {
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
      toast.success("Verification email sent!")
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthLayout
        title="Verification Email Sent"
        subtitle="Check your email for the verification link"
        showBackToHome={false}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <p className="text-muted-foreground">
              We've sent a new verification email to <strong>{email}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Please check your email (including spam folder) and click the verification link to activate your account.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setSuccess(false)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Send to Different Email
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

  return (
    <AuthLayout
      title="Resend Verification Email"
      subtitle="Enter your email to receive a new verification link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email address <span className="text-destructive">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200 placeholder:text-muted-foreground"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
          <p className="text-xs text-muted-foreground">
            We'll send a new verification email to this address.
          </p>
        </div>

        <LoadingButton
          type="submit"
          loading={isLoading}
          className="w-full"
          disabled={!watchedEmail}
        >
          <Mail className="mr-2 h-4 w-4" />
          Send Verification Email
        </LoadingButton>

        <div className="text-center space-y-2">
          <Link
            href="/auth/signin"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
          
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