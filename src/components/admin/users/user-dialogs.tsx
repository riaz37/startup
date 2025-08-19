import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "BANNED" | "PENDING";
  createdAt: string;
  lastLoginAt?: string;
}

interface UserDialogsProps {
  selectedUser: User | null;
  showDeleteDialog: boolean;
  showRoleDialog: boolean;
  showBanDialog: boolean;
  onDeleteDialogChange: (open: boolean) => void;
  onRoleDialogChange: (open: boolean) => void;
  onBanDialogChange: (open: boolean) => void;
  onDeleteUser: (userId: string) => void;
  onRoleChange: (userId: string, newRole: User["role"]) => void;
  onBanUser: (userId: string, ban: boolean) => void;
}

export function UserDialogs({
  selectedUser,
  showDeleteDialog,
  showRoleDialog,
  showBanDialog,
  onDeleteDialogChange,
  onRoleDialogChange,
  onBanDialogChange,
  onDeleteUser,
  onRoleChange,
  onBanUser
}: UserDialogsProps) {
  // Don't render dialogs if no user is selected
  if (!selectedUser) {
    return null;
  }

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={onDeleteDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDeleteUser(selectedUser.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={onRoleDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change User Role</AlertDialogTitle>
            <AlertDialogDescription>
              Select a new role for {selectedUser.name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            {["USER", "ADMIN"].map((role) => (
              <Button
                key={role}
                variant="outline"
                onClick={() => onRoleChange(selectedUser.id, role as User["role"])}
                className="justify-start"
              >
                <Shield className="mr-2 h-4 w-4" />
                {role}
              </Button>
            ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban/Unban Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={onBanDialogChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser.status === "ACTIVE" ? "Ban User" : "Unban User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser.status === "ACTIVE" 
                ? `Are you sure you want to ban ${selectedUser.name}? They will not be able to access the platform.`
                : `Are you sure you want to unban ${selectedUser.name}? They will regain access to the platform.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onBanUser(selectedUser.id, selectedUser.status === "ACTIVE")}
              className={selectedUser.status === "ACTIVE" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              {selectedUser.status === "ACTIVE" ? "Ban User" : "Unban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 