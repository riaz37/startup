import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { FeatureCard } from "@/components/common";
import { HelpCategoryCard, HelpArticleCard } from "@/components/help";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search,
  ShoppingCart,
  Users,
  CreditCard,
  Truck,
  Shield,
  HelpCircle,
  MessageCircle
} from "lucide-react";

export default async function HelpPage() {
  const helpCategories = [
    {
      icon: ShoppingCart,
      title: "Getting Started",
      iconColor: "primary" as const,
      links: [
        { href: "#getting-started-1", title: "How to create an account" },
        { href: "#getting-started-2", title: "Your first group order" },
        { href: "#getting-started-3", title: "Understanding group pricing" },
        { href: "#getting-started-4", title: "Setting up your profile" }
      ]
    },
    {
      icon: Users,
      title: "Group Orders",
      iconColor: "secondary" as const,
      links: [
        { href: "#group-orders-1", title: "How group orders work" },
        { href: "#group-orders-2", title: "Joining an existing order" },
        { href: "#group-orders-3", title: "Creating your own group order" },
        { href: "#group-orders-4", title: "Managing group order deadlines" }
      ]
    },
    {
      icon: CreditCard,
      title: "Payments & Billing",
      iconColor: "accent" as const,
      links: [
        { href: "#payments-1", title: "When am I charged?" },
        { href: "#payments-2", title: "Payment methods accepted" },
        { href: "#payments-3", title: "Refunds and cancellations" },
        { href: "#payments-4", title: "Understanding pricing tiers" }
      ]
    },
    {
      icon: Truck,
      title: "Delivery & Shipping",
      iconColor: "primary" as const,
      links: [
        { href: "#delivery-1", title: "Delivery options" },
        { href: "#delivery-2", title: "Tracking your order" },
        { href: "#delivery-3", title: "Pickup locations" },
        { href: "#delivery-4", title: "Delivery timeframes" }
      ]
    },
    {
      icon: Shield,
      title: "Account & Security",
      iconColor: "secondary" as const,
      links: [
        { href: "#security-1", title: "Account security" },
        { href: "#security-2", title: "Privacy settings" },
        { href: "#security-3", title: "Changing your password" },
        { href: "#security-4", title: "Deleting your account" }
      ]
    },
    {
      icon: HelpCircle,
      title: "Troubleshooting",
      iconColor: "accent" as const,
      links: [
        { href: "#troubleshooting-1", title: "Common issues" },
        { href: "#troubleshooting-2", title: "Browser compatibility" },
        { href: "#troubleshooting-3", title: "Mobile app issues" },
        { href: "#troubleshooting-4", title: "Report a bug" }
      ]
    }
  ];

  const popularArticles = [
    {
      badge: { text: "Most Popular", variant: "secondary" as const },
      title: "Complete Guide to Group Orders",
      description: "Everything you need to know about joining and creating group orders, from start to finish.",
      readTime: "5 min read",
      href: "#"
    },
    {
      badge: { text: "Updated", variant: "outline" as const },
      title: "Understanding Bulk Pricing",
      description: "Learn how our tiered pricing system works and how to maximize your savings through group purchases.",
      readTime: "3 min read",
      href: "#"
    },
    {
      badge: { text: "Guide", variant: "outline" as const },
      title: "Payment and Billing FAQ",
      description: "Common questions about when you're charged, payment methods, and what happens if an order is cancelled.",
      readTime: "4 min read",
      href: "#"
    },
    {
      badge: { text: "Tips", variant: "outline" as const },
      title: "Maximizing Your Savings",
      description: "Pro tips and strategies for getting the best deals and making the most of group ordering opportunities.",
      readTime: "6 min read",
      href: "#"
    }
  ];

  return (
    <PageLayout>
      <MainContainer>
        <PageHeader
          badge="🆘 Help Center"
          title="How Can We Help You?"
          highlightedWord="Help You?"
          description="Find answers to common questions, learn how to use Sohozdaam effectively, and get the most out of group ordering."
        />

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-16">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for help articles, guides, or FAQs..."
            className="pl-12 py-6 text-lg"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={MessageCircle}
            title="Contact Support"
            description="Get personalized help from our support team"
            iconColor="primary"
          />
          <FeatureCard
            icon={Users}
            title="Community Forum"
            description="Connect with other users and share tips"
            iconColor="secondary"
          />
          <FeatureCard
            icon={HelpCircle}
            title="Video Tutorials"
            description="Watch step-by-step guides and tutorials"
            iconColor="accent"
          />
        </div>

        {/* Help Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <HelpCategoryCard
                key={index}
                icon={category.icon}
                title={category.title}
                iconColor={category.iconColor}
                links={category.links}
              />
            ))}
          </div>
        </div>

        {/* Popular Articles */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Popular Articles</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {popularArticles.map((article, index) => (
              <HelpArticleCard
                key={index}
                badge={article.badge}
                title={article.title}
                description={article.description}
                readTime={article.readTime}
                href={article.href}
              />
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="text-center">
          <Card className="card-sohozdaam max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find what you're looking for? Our support team is here to help 
                you with any questions or issues you might have.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="/contact">Contact Support</a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:help@sohozdaam.com">Email Us</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainContainer>
    </PageLayout>
  );
}