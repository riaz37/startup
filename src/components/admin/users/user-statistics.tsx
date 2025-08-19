import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, Shield } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "BANNED" | "PENDING";
  createdAt: string;
  lastLoginAt?: string;
}

interface UserStatisticsProps {
  users: User[];
  totalUsers?: number;
}

export function UserStatistics({ users, totalUsers }: UserStatisticsProps) {
  const activeUsers = users.filter(u => u.status === "ACTIVE").length;
  const bannedUsers = users.filter(u => u.status === "BANNED").length;
  const adminUsers = users.filter(u => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{totalUsers || users.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Banned Users</p>
              <p className="text-2xl font-bold text-red-600">{bannedUsers}</p>
            </div>
            <UserX className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold text-blue-600">{adminUsers}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 