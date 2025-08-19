import { useState, useCallback } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPER_ADMIN";
  status: "ACTIVE" | "BANNED" | "PENDING";
  createdAt: string;
  lastLoginAt?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  status?: "ACTIVE" | "BANNED" | "PENDING";
}

interface UseAdminUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
  fetchUsers: (search?: string, role?: string, status?: string, page?: number, limit?: number) => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<User | null>;
  updateUser: (userId: string, updates: UpdateUserRequest) => Promise<User | null>;
  deleteUser: (userId: string) => Promise<boolean>;
  banUser: (userId: string, ban: boolean) => Promise<boolean>;
  changeUserRole: (userId: string, newRole: User["role"]) => Promise<boolean>;
}

export function useAdminUsers(): UseAdminUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchUsers = useCallback(async (search?: string, role?: string, status?: string, page: number = 1, limit: number = 20) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (role) params.append("role", role);
      if (status) params.append("status", status);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users || []);
      setPagination(data.pagination || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch users";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserRequest): Promise<User | null> => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      const newUser = await response.json();
      setUsers(prev => [newUser, ...prev]);
      toast.success("User created successfully");
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create user";
      toast.error(errorMessage);
      return null;
    }
  }, []);

  const updateUser = useCallback(async (userId: string, updates: UpdateUserRequest): Promise<User | null> => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }

      const updatedUser = await response.json();
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      toast.success("User updated successfully");
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user";
      toast.error(errorMessage);
      return null;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }

      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success("User deleted successfully");
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user";
      toast.error(errorMessage);
      return false;
    }
  }, []);

  const banUser = useCallback(async (userId: string, ban: boolean): Promise<boolean> => {
    try {
      const status = ban ? "BANNED" : "ACTIVE";
      const updatedUser = await updateUser(userId, { status });
      return updatedUser !== null;
    } catch (err) {
      const action = ban ? "ban" : "unban";
      toast.error(`Failed to ${action} user`);
      return false;
    }
  }, [updateUser]);

  const changeUserRole = useCallback(async (userId: string, newRole: User["role"]): Promise<boolean> => {
    try {
      const updatedUser = await updateUser(userId, { role: newRole });
      return updatedUser !== null;
    } catch (err) {
      toast.error("Failed to change user role");
      return false;
    }
  }, [updateUser]);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    banUser,
    changeUserRole,
  };
} 