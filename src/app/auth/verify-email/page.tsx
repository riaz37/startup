"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const resendSchema = z.object({
  email: z.string().email("Invalid email address")
})

type ResendInput = z.infer<typeof resendSchema>

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [lastUsedEmail, setLastUsedEmail] = useState("")
  
  // Check if user was redirected from login
  const fromLogin = searchParams.get("from") === "login"
  const userEmail = searchParams.get("email")

  const form = useForm<ResendInput>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: userEmail || ""
    }
  })

  const handleResendVerification = async (emailToUse: string) => {
    setIsLoading(true)
    setLastUsedEmail(emailToUse)

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToUse })
      })

      if (response.ok) {
        setSuccess(true)
        toast.success("Verification email sent!")
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to send verification email")
      }
    } catch (error) {
      console.error("Resend verification error:", error)
      toast.error("Failed to send verification email")
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ResendInput) => {
    await handleResendVerification(data.email)
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
              We&apos;ve sent a new verification email to <strong>{lastUsedEmail || userEmail}</strong>.
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
      title={fromLogin ? "Email Verification Required" : "Verify Your Email"}
      subtitle={
        fromLogin 
          ? "Please verify your email address before signing in"
          : "Enter your email to receive a verification link"
      }
    >
      {fromLogin && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center space-x-2 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">
              Your account needs email verification to continue
            </span>
          </div>
        </div>
      )}

      {!showEmailForm ? (
        <div className="text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {fromLogin ? "Email Verification Required" : "Verify Your Email"}
            </h2>
            
            <p className="text-muted-foreground">
              {fromLogin 
                ? `We need to verify your email address (${userEmail}) before you can access your account.`
                : "We&apos;ll send you a verification link to activate your account."
              }
            </p>
            
            {fromLogin && (
              <p className="text-sm text-muted-foreground">
                Check your email for the verification link, or request a new one below.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleResendVerification(userEmail || "")}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <Button
              onClick={() => setShowEmailForm(true)}
              variant="outline"
              className="w-full"
            >
              Use Different Email
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-lg font-medium">Enter Different Email</h3>
            <p className="text-sm text-muted-foreground">
              If you want to use a different email address for verification
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email address"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Email
                  </>
                )}
              </Button>
            </form>
          </Form>

          <Button
            onClick={() => setShowEmailForm(false)}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Main View
          </Button>
        </div>
      )}

      <div className="mt-6 text-center space-y-3">
        <Link
          href="/auth/signin"
          className="block text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Back to Sign In
        </Link>
        
        <Link
          href="/auth/signup"
          className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Don&apos;t have an account? Sign up
        </Link>
      </div>
    </AuthLayout>
  )
} 