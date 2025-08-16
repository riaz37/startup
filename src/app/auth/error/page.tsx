"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Home, Loader2 } from "lucide-react"
import Link from "next/link"

const errorMessages = {
  MissingToken: {
    title: "Missing Verification Token",
    description: "The verification link is missing required information."
  },
  InvalidToken: {
    title: "Invalid Verification Token", 
    description: "This verification link is invalid or has already been used."
  },
  ExpiredToken: {
    title: "Expired Verification Token",
    description: "This verification link has expired. Please request a new one."
  },
  ServerError: {
    title: "Server Error",
    description: "An unexpected error occurred. Please try again later."
  },
  Default: {
    title: "Authentication Error",
    description: "An error occurred during authentication. Please try again."
  }
}

export default function AuthErrorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const errorType = searchParams.get("error") as keyof typeof errorMessages || "Default"
  
  const error = errorMessages[errorType] || errorMessages.Default

  const handleRetry = async () => {
    setIsLoading(true)
    try {
      if (errorType === "ExpiredToken" || errorType === "InvalidToken" || errorType === "MissingToken") {
        router.push("/auth/resend-verification")
      } else {
        router.push("/auth/signin")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title={error.title}
      subtitle={error.description}
      showBackToHome={false}
    >
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <p className="text-muted-foreground">
            {error.description}
          </p>
          {(errorType === "ExpiredToken" || errorType === "InvalidToken") && (
            <p className="text-sm text-muted-foreground">
              You can request a new verification email to continue.
            </p>
          )}
        </div>

        <div className="space-y-3">
          {(errorType === "ExpiredToken" || errorType === "InvalidToken" || errorType === "MissingToken") ? (
            <>
              <Button
                onClick={handleRetry}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Request New Verification Email
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push("/auth/signin")}
                className="w-full"
                disabled={isLoading}
              >
                Back to Sign In
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleRetry}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="w-full"
                disabled={isLoading}
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </>
          )}
          
          <p className="text-xs text-muted-foreground">
            Need help?{" "}
            <Link
              href="/contact"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}