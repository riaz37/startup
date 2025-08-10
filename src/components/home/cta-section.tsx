import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  user?: {
    name: string;
  } | null;
}

export function CTASection({ user }: CTASectionProps) {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-primary/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
          Ready to Start Saving?
        </h2>
        <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
          Join thousands of smart shoppers who are already saving money with
          group orders.
        </p>

        {!user ? (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              asChild
            >
              <Link href="/auth/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link href="/group-orders">Browse Orders</Link>
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6"
            asChild
          >
            <Link href="/group-orders">
              Explore Group Orders
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}