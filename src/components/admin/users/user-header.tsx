import { Button } from "@/components/ui/button";
import { Users, Plus, Download } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "BANNED" | "PENDING";
  createdAt: string;
  lastLoginAt?: string;
}

interface UserHeaderProps {
  currentUserRole: string;
  filteredUsers: User[];
  totalUsers?: number;
}

export function UserHeader({ currentUserRole, filteredUsers, totalUsers }: UserHeaderProps) {
  const router = useRouter();

  const handleExportCSV = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Status', 'Created', 'Last Login'].join(','),
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.role,
        user.status,
        new Date(user.createdAt).toLocaleDateString(),
        user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center mr-4">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={filteredUsers.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {currentUserRole === "SUPER_ADMIN" && (
            <Button onClick={() => router.push("/admin/users/create-admin")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Admin
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 