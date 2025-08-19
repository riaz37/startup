"use client";

import { Button } from "@/components/ui/button";
import { Wifi, RefreshCw, Mail, Settings } from "lucide-react";

interface ActionHeaderProps {
  onTestConnection: () => void;
  onRetryFailed: () => void;
  isTestingConnection: boolean;
  isRetryingFailed: boolean;
}

export function ActionHeader({ 
  onTestConnection, 
  onRetryFailed, 
  isTestingConnection, 
  isRetryingFailed 
}: ActionHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Email Management
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            Manage email templates, campaigns, and monitor delivery performance
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={onTestConnection} 
          disabled={isTestingConnection}
          variant="outline"
          size="lg"
          className="h-12 px-6 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
        >
          <Wifi className="h-4 w-4 mr-2" />
          {isTestingConnection ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button 
          onClick={onRetryFailed} 
          disabled={isRetryingFailed}
          variant="outline"
          size="lg"
          className="h-12 px-6 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {isRetryingFailed ? 'Retrying...' : 'Retry Failed'}
        </Button>
      </div>
    </div>
  );
} 