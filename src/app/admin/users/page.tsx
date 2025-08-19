"use client";

import { useState, useEffect } from "react";
import { ClientPageLayout, MainContainer } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useAdminUsers } from "@/hooks/api/use-admin-users";
import {
  UserStatistics,
  UserFilters,
  UserTable,
  UserPagination,
  UserDialogs,
  UserHeader,
  UserTableSkeleton
} from "@/components/admin/users";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "BANNED" | "PENDING";
  createdAt: string;
  lastLoginAt?: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    updateUser,
    deleteUser,
    banUser,
    changeUserRole,
  } = useAdminUsers();

  // Fetch users on component mount
  useEffect(() => {
    if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      fetchUsers();
      setLastRefresh(new Date());
    }
  }, [user, fetchUsers]);

  // Filter users based on search term and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSearch = () => {
    const roleParam = roleFilter === "all" ? undefined : roleFilter;
    const statusParam = statusFilter === "all" ? undefined : statusFilter;
    fetchUsers(searchTerm, roleParam, statusParam);
    setLastRefresh(new Date());
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    fetchUsers();
    setLastRefresh(new Date());
  };

  // Auto-refresh when filters change
  useEffect(() => {
    if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
      const timeoutId = setTimeout(() => {
        if (searchTerm || roleFilter !== "all" || statusFilter !== "all") {
          const roleParam = roleFilter === "all" ? undefined : roleFilter;
          const statusParam = statusFilter === "all" ? undefined : statusFilter;
          fetchUsers(searchTerm, roleParam, statusParam);
          setLastRefresh(new Date());
        }
      }, 500); // Debounce filter changes

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, roleFilter, statusFilter, user, fetchUsers]);

  // Close dialogs when selected user changes
  useEffect(() => {
    if (!selectedUser) {
      setShowDeleteDialog(false);
      setShowRoleDialog(false);
      setShowBanDialog(false);
    }
  }, [selectedUser]);

  const handleDeleteUser = async (userId: string) => {
    try {
      const success = await deleteUser(userId);
      if (success) {
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: User["role"]) => {
    try {
      const success = await changeUserRole(userId, newRole);
      if (success) {
        setShowRoleDialog(false);
      }
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handleBanUser = async (userId: string, ban: boolean) => {
    try {
      const success = await banUser(userId, ban);
      if (success) {
        setShowBanDialog(false);
      }
    } catch (error) {
      console.error("Failed to ban/unban user:", error);
    }
  };

  const handlePageChange = (page: number) => {
    const roleParam = roleFilter === "all" ? undefined : roleFilter;
    const statusParam = statusFilter === "all" ? undefined : statusFilter;
    fetchUsers(searchTerm, roleParam, statusParam, page);
  };

  const handleRefresh = () => {
    const roleParam = roleFilter === "all" ? undefined : roleFilter;
    const statusParam = statusFilter === "all" ? undefined : statusFilter;
    fetchUsers(searchTerm, roleParam, statusParam);
    setLastRefresh(new Date());
  };

  // Early return for unauthorized users - must come after all hooks
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    return (
      <ClientPageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Access denied. Admin privileges required.</p>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  return (
    <ClientPageLayout>
      <MainContainer>
        {/* Header */}
        <UserHeader 
          currentUserRole={user.role}
          filteredUsers={filteredUsers}
          totalUsers={pagination?.total}
        />

        {/* User Statistics */}
        <UserStatistics 
          users={users}
          totalUsers={pagination?.total}
        />

        {/* Search and Filters */}
        <UserFilters
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onRoleFilterChange={setRoleFilter}
          onStatusFilterChange={setStatusFilter}
          onSearch={handleSearch}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          loading={loading}
          totalUsers={pagination?.total}
          filteredCount={filteredUsers.length}
          lastRefresh={lastRefresh}
        />

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        {loading ? (
          <UserTableSkeleton />
        ) : (
          <>
            <UserTable
              users={filteredUsers}
              currentUserRole={user.role}
              onEditUser={(user) => setSelectedUser(user)}
              onChangeRole={(user) => {
                setSelectedUser(user);
                setShowRoleDialog(true);
              }}
              onBanUser={(user) => {
                setSelectedUser(user);
                setShowBanDialog(true);
              }}
              onDeleteUser={(user) => {
                setSelectedUser(user);
                setShowDeleteDialog(true);
              }}
            />

            {/* Pagination Controls */}
            {pagination && (
              <UserPagination
                pagination={pagination}
                searchTerm={searchTerm}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                onPageChange={handlePageChange}
                loading={loading}
              />
            )}
          </>
        )}

        {/* User Action Dialogs */}
        {selectedUser && (
          <UserDialogs
            selectedUser={selectedUser}
            showDeleteDialog={showDeleteDialog}
            showRoleDialog={showRoleDialog}
            showBanDialog={showBanDialog}
            onDeleteDialogChange={setShowDeleteDialog}
            onRoleDialogChange={setShowRoleDialog}
            onBanDialogChange={setShowBanDialog}
            onDeleteUser={handleDeleteUser}
            onRoleChange={handleRoleChange}
            onBanUser={handleBanUser}
          />
        )}
      </MainContainer>
    </ClientPageLayout>
  );
} 