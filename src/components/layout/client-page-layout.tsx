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
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {!hideNavigation && <Navigation user={user} />}
      {children}
      {showFooter && <Footer />}
    </div>
  );
} 