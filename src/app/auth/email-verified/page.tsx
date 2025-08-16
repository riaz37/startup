"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Mail } from "lucide-react"

export default function EmailVerifiedPage() {
  const router = useRouter()

  // Auto-redirect to signin after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/auth/signin?message=Email verified successfully")
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <AuthLayout
      title="Email Verified Successfully!"
      subtitle="Your account is now active and ready to use"
      showBackToHome={false}
    >
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            🎉 Welcome to Sohozdaam!
          </h2>
          
          <p className="text-gray-600">
            Your email address has been successfully verified. Your account is now fully activated and you can start enjoying all the benefits of group buying!
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <Mail className="h-5 w-5" />
              <span className="text-sm font-medium">
                You can now sign in to your account
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/auth/signin?message=Email verified successfully")}
            className="w-full"
            size="lg"
          >
            Sign In to Your Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Link
            href="/"
            className="block text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Return to Home
          </Link>
        </div>

        <div className="text-xs text-gray-500">
          You will be automatically redirected to the sign-in page in a few seconds...
        </div>
      </div>
    </AuthLayout>
  )
}