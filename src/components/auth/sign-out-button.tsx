"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface SignOutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function SignOutButton({ className, children }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ callbackUrl: "/" });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? "Signing out..." : (children || "Sign out")}
    </button>
  );
}