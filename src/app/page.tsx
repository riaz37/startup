import { getCurrentUser } from "@/lib/auth-utils";
import {
  Navigation,
  HeroSection,
  StatsSection,
  FeaturesSection,
  HowItWorksSection,
  TestimonialsSection,
  CTASection,
  Footer,
} from "@/components/home";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navigation user={user} />

      <HeroSection user={user} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <StatsSection />
      </div>

      <FeaturesSection />

      <HowItWorksSection />

      <TestimonialsSection />

      <CTASection user={user} />

      <Footer />
    </div>
  );
}
