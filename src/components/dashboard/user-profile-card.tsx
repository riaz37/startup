import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Shield, AlertTriangle, CheckCircle, Calendar, Star } from "lucide-react";
import Link from "next/link";

interface UserProfileCardProps {
  user: {
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  memberSince?: number;
}

export function UserProfileCard({ user, memberSince }: UserProfileCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 mr-3">
            <User className="h-5 w-5 text-primary-foreground" />
          </div>
          Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Info Grid */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold text-foreground">{user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg font-semibold text-foreground">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <Badge 
                variant="outline" 
                className={`mt-1 ${getRoleColor(user.role)}`}
              >
                {user.role.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
            {user.isVerified ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge 
                variant="outline"
                className={user.isVerified ? 
                  "bg-green-100 text-green-800 border-green-200" : 
                  "bg-yellow-100 text-yellow-800 border-yellow-200"
                }
              >
                {user.isVerified ? "Verified" : "Pending Verification"}
              </Badge>
            </div>
          </div>

          {memberSince !== undefined && (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="text-lg font-semibold text-foreground">
                  {memberSince} days
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Verification Alert */}
        {!user.isVerified && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <div className="space-y-3">
                <p className="font-medium">Email Verification Required</p>
                <p className="text-sm">
                  Please check your email and click the verification link to activate your account.
                </p>
                <Button size="sm" variant="outline" asChild className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  <Link href="/auth/resend-verification">
                    Resend Verification Email
                  </Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Member Badge */}
        {memberSince !== undefined && memberSince > 30 && (
          <div className="flex items-center justify-center p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
            <Star className="h-5 w-5 text-amber-600 mr-2" />
            <span className="text-sm font-medium text-amber-800">
              {memberSince > 90 ? "Loyal Member" : memberSince > 60 ? "Regular Member" : "Active Member"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}