import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingDown,
  Users,
  Shield,
  Zap,
  Globe,
  Smartphone,
} from "lucide-react";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: TrendingDown,
    title: "Massive Savings",
    description: "Save up to 70% on products by joining group orders. The more people join, the bigger the discount."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Connect with like-minded shoppers and build a community around smart purchasing decisions."
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "Your payments are protected with bank-level security. Shop with confidence and peace of mind."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Quick and easy ordering process. Join a group order in seconds and start saving immediately."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Access products from around the world with international shipping and local pickup options."
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Shop on the go with our responsive design. Perfect experience on desktop, tablet, and mobile."
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why Choose Sohozdaam?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We make group buying simple, secure, and rewarding for everyone
            involved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}