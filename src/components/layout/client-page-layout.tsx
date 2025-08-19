"use client";

import { useSession } from "next-auth/react";
import { Navigation } from "@/components/home/navigation";
import { Footer } from "@/components/home/footer";

interface ClientPageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function ClientPageLayout({ children, showFooter = true }: ClientPageLayoutProps) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navigation user={session?.user} />
      <div className="responsive-content-wrapper">
        {children}
      </div>
      {showFooter && <Footer />}
    </div>
  );
} 