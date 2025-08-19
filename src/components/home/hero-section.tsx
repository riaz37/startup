import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
    isVerified?: boolean;
    image?: string | null;
  } | null;
}

export function HeroSection({ user }: HeroSectionProps) {
  return (
    <section className="hero-responsive relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container-responsive relative">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-4 sm:mb-6 text-responsive-sm sm:text-responsive-base">
            🎉 Now in Beta - Join the savings revolution!
          </Badge>

          <h1 className="text-responsive-3xl sm:text-responsive-4xl lg:text-responsive-6xl xl:text-responsive-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight">
            Save More with{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Group Orders
            </span>
          </h1>

          <p className="text-responsive-lg sm:text-responsive-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
            Join forces with others to unlock bulk discounts and save money on
            your favorite products. The more people join, the bigger the
            savings for everyone.
          </p>

          <div className="button-group-responsive justify-center mb-8 sm:mb-12">
            {!user ? (
              <>
                <Button size="lg" className="text-responsive-base sm:text-responsive-lg px-6 sm:px-8 py-4 sm:py-6 mobile-touch-target" asChild>
                  <Link href="/auth/signup">
                    Start Saving Today
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-responsive-base sm:text-responsive-lg px-6 sm:px-8 py-4 sm:py-6 mobile-touch-target"
                  asChild
                >
                  <Link href="/group-orders">Browse Group Orders</Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="text-responsive-base sm:text-responsive-lg px-6 sm:px-8 py-4 sm:py-6 mobile-touch-target" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-responsive-base sm:text-responsive-lg px-6 sm:px-8 py-4 sm:py-6 mobile-touch-target"
                  asChild
                >
                  <Link href="/group-orders">Join Group Orders</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}