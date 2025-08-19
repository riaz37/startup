import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Shield, UserCheck, UserX, Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "BANNED" | "PENDING";
  createdAt: string;
  lastLoginAt?: string;
}

interface UserTableProps {
  users: User[];
  currentUserRole: string;
  onEditUser: (user: User) => void;
  onChangeRole: (user: User) => void;
  onBanUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
}

export function UserTable({
  users,
  currentUserRole,
  onEditUser,
  onChangeRole,
  onBanUser,
  onDeleteUser
}: UserTableProps) {
  const getRoleBadgeVariant = (role: User["role"]) => {
    switch (role) {
      case "SUPER_ADMIN": return "destructive";
      case "ADMIN": return "default";
      case "USER": return "secondary";
      default: return "secondary";
    }
  };

  const getStatusBadgeVariant = (status: User["status"]) => {
    switch (status) {
      case "ACTIVE": return "default";
      case "BANNED": return "destructive";
      case "PENDING": return "secondary";
      default: return "secondary";
    }
  };

  if (users.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No users found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((userItem) => (
              <TableRow key={userItem.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{userItem.name}</div>
                    <div className="text-sm text-muted-foreground">{userItem.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(userItem.role)}>
                    {userItem.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(userItem.status)}>
                    {userItem.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(userItem.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {userItem.lastLoginAt ? new Date(userItem.lastLoginAt).toLocaleDateString() : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEditUser(userItem)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      {currentUserRole === "SUPER_ADMIN" && userItem.role !== "SUPER_ADMIN" && (
                        <DropdownMenuItem onClick={() => onChangeRole(userItem)}>
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                      )}
                      {userItem.status === "ACTIVE" ? (
                        <DropdownMenuItem onClick={() => onBanUser(userItem)}>
                          <UserX className="mr-2 h-4 w-4" />
                          Ban User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => onBanUser(userItem)}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Unban User
                        </DropdownMenuItem>
                      )}
                      {currentUserRole === "SUPER_ADMIN" && userItem.role !== "SUPER_ADMIN" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onDeleteUser(userItem)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 