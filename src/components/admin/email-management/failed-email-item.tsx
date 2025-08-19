"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, AlertCircle, RefreshCw } from "lucide-react";

interface FailedEmail {
  id: string;
  to: string;
  subject: string;
  template: string;
  error: string;
  retryCount: number;
  maxRetries: number;
  lastAttempt: string;
}

interface FailedEmailItemProps {
  email: FailedEmail;
}

export function FailedEmailItem({ email }: FailedEmailItemProps) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-gray-900">{email.to}</span>
              </div>
              <Badge variant="destructive" className="text-xs">
                Failed
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>{email.subject}</span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Template: {email.template}</span>
              <div className="flex items-center space-x-1">
                <RefreshCw className="h-3 w-3" />
                <span>Retries: {email.retryCount}/{email.maxRetries}</span>
              </div>
              <span>Last Attempt: {new Date(email.lastAttempt).toLocaleString()}</span>
            </div>
            
            <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-800 mb-1">Error Details</p>
                <p className="text-red-700">{email.error}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 