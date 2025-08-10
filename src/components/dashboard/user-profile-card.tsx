import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";

interface UserProfileCardProps {
  user: {
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  return (
    <Card className="card-sohozdaam">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-6 w-6 text-primary mr-2" />
          Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Role</p>
                <Badge variant="secondary" className="mt-1">
                  {user.role}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {user.isVerified ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge 
                  className={user.isVerified ? "badge-success" : "badge-warning"}
                >
                  {user.isVerified ? "Verified" : "Pending Verification"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {!user.isVerified && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="space-y-2">
                <p className="font-medium">Email Verification Required</p>
                <p className="text-sm">
                  Please check your email and click the verification link to activate your account.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/auth/resend-verification">
                    Resend Verification Email
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}