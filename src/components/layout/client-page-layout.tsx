"use client";

import { useSession } from "next-auth/react";
import { Navigation } from "@/components/home/navigation";
import { Footer } from "@/components/home/footer";

interface ClientPageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  hideNavigation?: boolean;
  user?: {
    name?: string | null;
    email?: string | null;
    role: string;
    isVerified: boolean;
    image?: string | null;
  } | null;
}

export function ClientPageLayout({ children, showFooter = true, hideNavigation = false, user }: ClientPageLayoutProps) {
  const { data: session } = useSession();
  const currentUser = user || session?.user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {!hideNavigation && <Navigation user={currentUser} />}
      <div className="responsive-content-wrapper">
        {children}
      </div>
      {showFooter && <Footer />}
    </div>
  );
} 