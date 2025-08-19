"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientPageLayout, MainContainer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, ArrowLeft, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

interface CreateAdminForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "ADMIN" | "SUPER_ADMIN";
}

export default function CreateAdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState<CreateAdminForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateAdminForm>>({});

  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return (
      <ClientPageLayout>
        <MainContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">Access denied. Super admin privileges required.</p>
            </div>
          </div>
        </MainContainer>
      </ClientPageLayout>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateAdminForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: formData.role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create admin user");
      }

      toast.success("Admin user created successfully!");
      router.push("/admin/users");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create admin user");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateAdminForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <ClientPageLayout>
      <MainContainer>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center mr-4">
                <UserPlus className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create Admin User</h1>
                <p className="text-muted-foreground">Create a new administrator account</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin/users">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Link>
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Admin User Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter full name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter email address"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Role Field */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "ADMIN" | "SUPER_ADMIN") => 
                      handleInputChange("role", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose the appropriate role for this user
                  </p>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Enter password"
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm password"
                    className={errors.confirmPassword ? "border-red-500" : ""}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Warning Alert */}
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> Admin users will have access to sensitive platform data and management functions. 
                    Ensure you trust the person you are granting access to.
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/users")}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create Admin User"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </MainContainer>
    </ClientPageLayout>
  );
} 