import { Navigation } from "@/components/home/navigation";
import { Footer } from "@/components/home/footer";
import { getCurrentUser } from "@/lib";

interface PageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export async function PageLayout({ children, showFooter = true }: PageLayoutProps) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navigation user={user} />
      {children}
      {showFooter && <Footer />}
    </div>
  );
}