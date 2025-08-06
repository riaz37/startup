"use client"

import { useRouter } from "next/navigation"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { CheckCircle, Sparkles } from "lucide-react"

export default function EmailVerifiedPage() {
  const router = useRouter()

  return (
    <AuthLayout
      title="Email Verified!"
      subtitle="Welcome to Sohozdaam! Your account is now active"
      showBackToHome={false}
    >
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 relative">
          <CheckCircle className="h-8 w-8 text-primary" />
          <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
        </div>
        
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Congratulations! Your email has been successfully verified and your account is now active.
          </p>
          <p className="text-sm text-muted-foreground">
            You can now sign in and start joining group orders to save money on your purchases.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/auth/signin?message=Email verified successfully")}
            className="w-full"
          >
            Sign In to Your Account
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Ready to start saving with group orders!
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}