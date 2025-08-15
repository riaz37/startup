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
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6">
            🎉 Now in Beta - Join the savings revolution!
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            Save More with{" "}
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Group Orders
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Join forces with others to unlock bulk discounts and save money on
            your favorite products. The more people join, the bigger the
            savings for everyone.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {!user ? (
              <>
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/auth/signup">
                    Start Saving Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                  asChild
                >
                  <Link href="/group-orders">Browse Group Orders</Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
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