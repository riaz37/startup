"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { z } from "zod"
import { authApi } from "@/lib/auth-api"

const resendSchema = z.object({
  email: z.string().email("Invalid email address")
})

type ResendInput = z.infer<typeof resendSchema>

export default function ResendVerificationPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")

  const form = useForm<ResendInput>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: ""
    }
  })

  const onSubmit = async (data: ResendInput) => {
    setIsLoading(true)
    setEmail(data.email)

    try {
      await authApi.resendVerification(data)
      
      setSuccess(true)
      toast.success("Verification email sent!")
    } catch (error: unknown) {
      // Error handling is done by the axios interceptor
      const errorMessage = error.response?.data?.error || "Failed to send verification email"
      console.error("Resend verification error:", errorMessage)
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
              We&apos;ve sent a new verification email to <strong>{email}</strong>.
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email address <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  We&apos;ll send a new verification email to this address.
                </p>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !form.watch("email")}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Send Verification Email
          </Button>

          <div className="text-center space-y-2">
            <Link
              href="/auth/signin"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
            
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </AuthLayout>
  )
}