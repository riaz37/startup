import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { FeatureCard, StatsGrid } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Heart, Zap, Shield, Globe } from "lucide-react";

export default async function AboutPage() {
  const stats = [
    { value: "50K+", label: "Happy Customers", color: "primary" as const },
    { value: "$2M+", label: "Total Savings", color: "secondary" as const },
    { value: "1000+", label: "Group Orders", color: "accent" as const },
    { value: "25%", label: "Average Savings", color: "primary" as const }
  ];

  return (
    <PageLayout>
      <MainContainer>
        <PageHeader
          badge="🌟 About Sohozdaam"
          title="Revolutionizing Group Shopping"
          highlightedWord="Group Shopping"
          description="We believe that shopping together should save everyone money. Our platform connects people to unlock bulk discounts and make quality products more affordable for everyone."
        />

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="card-hover">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-primary mr-3" />
                <h2 className="text-2xl font-bold">Our Mission</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                To make quality products accessible to everyone by harnessing the power of 
                collective buying. We connect communities to unlock bulk discounts and create 
                a more affordable shopping experience for all.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-8">
              <div className="flex items-center mb-4">
                <Globe className="h-8 w-8 text-secondary mr-3" />
                <h2 className="text-2xl font-bold">Our Vision</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                A world where smart shopping is collaborative shopping. We envision communities 
                coming together to access better prices, reduce waste, and build stronger 
                connections through shared purchasing power.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at Sohozdaam
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Users}
              title="Community First"
              description="We believe in the power of community. Every feature we build strengthens connections between people and creates shared value."
              iconColor="primary"
            />
            <FeatureCard
              icon={Shield}
              title="Trust & Transparency"
              description="We maintain complete transparency in pricing, delivery, and processes. Trust is the foundation of successful group orders."
              iconColor="secondary"
            />
            <FeatureCard
              icon={Zap}
              title="Innovation"
              description="We continuously innovate to make group buying simpler, faster, and more rewarding for everyone involved."
              iconColor="accent"
            />
          </div>
        </div>

        {/* Story */}
        <div className="mb-16">
          <Card className="card-sohozdaam">
            <CardContent className="p-8 md:p-12">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center mb-8">
                  <Heart className="h-8 w-8 text-primary mr-3" />
                  <h2 className="text-3xl font-bold">Our Story</h2>
                </div>
                
                <div className="prose prose-lg max-w-none text-muted-foreground">
                  <p className="mb-6">
                    Sohozdaam was born from a simple observation: people were paying too much for 
                    quality products because they were shopping alone. We saw friends and neighbors 
                    organizing informal group buys, sharing costs, and getting better deals together.
                  </p>
                  
                  <p className="mb-6">
                    What started as a solution for a few communities has grown into a platform that 
                    serves thousands of smart shoppers. We've facilitated millions in savings and 
                    helped build stronger communities through shared purchasing power.
                  </p>
                  
                  <p>
                    Today, we're proud to be the leading platform for group orders, but we're just 
                    getting started. Our goal is to make collaborative shopping the norm, not the 
                    exception, and to help everyone access better prices through the power of community.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <StatsGrid stats={stats} className="mb-16" />

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Built by a Passionate Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            We&apos;re a diverse group of engineers, designers, and community builders who believe 
            in the power of collaboration to create better shopping experiences.
          </p>
          
          <div className="flex justify-center space-x-4">
            <Badge variant="outline">🚀 Fast-growing</Badge>
            <Badge variant="outline">🌍 Remote-first</Badge>
            <Badge variant="outline">💡 Innovation-driven</Badge>
          </div>
        </div>
      </MainContainer>
    </PageLayout>
  );
}