import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";

export default async function TermsPage() {
  return (
    <PageLayout>
      <MainContainer>
        <PageHeader
          badge="📋 Terms of Service"
          title="Terms of Service"
          highlightedWord="Service"
          description="These terms govern your use of Sohozdaam and outline the rights and responsibilities of all parties involved in group ordering."
        />
        
        <div className="text-center text-sm text-muted-foreground mb-8">
          Last updated: January 10, 2025
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="card-sohozdaam">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">1. Acceptance of Terms</h2>
                  
                  <p className="text-muted-foreground mb-6">
                    By accessing or using Sohozdaam ("the Platform"), you agree to be bound by 
                    these Terms of Service ("Terms"). If you do not agree to these Terms, you 
                    may not use our services. These Terms apply to all users, including visitors, 
                    registered users, and group order organizers.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">2. Description of Service</h2>
                  
                  <p className="text-muted-foreground mb-4">
                    Sohozdaam is a platform that facilitates group purchasing by allowing users to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Join existing group orders to access bulk pricing</li>
                    <li>Create and manage group orders for products</li>
                    <li>Coordinate with other participants for delivery and payment</li>
                    <li>Access discounted pricing through collective purchasing power</li>
                  </ul>
                  
                  <p className="text-muted-foreground mb-6">
                    We act as an intermediary platform and are not the seller of the products 
                    offered through group orders.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">3. User Accounts and Registration</h2>
                  
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Account Creation</h3>
                  <p className="text-muted-foreground mb-4">
                    To use certain features of our platform, you must create an account. You agree to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>Update your information as necessary</li>
                    <li>Be responsible for all activities under your account</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Eligibility</h3>
                  <p className="text-muted-foreground mb-6">
                    You must be at least 18 years old to use our services. By using the platform, 
                    you represent that you meet this age requirement and have the legal capacity 
                    to enter into these Terms.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">4. Group Orders</h2>
                  
                  <h3 className="text-xl font-semibold mb-3 text-foreground">How Group Orders Work</h3>
                  <p className="text-muted-foreground mb-4">
                    Group orders operate on a threshold-based system:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Orders must reach minimum participation thresholds to proceed</li>
                    <li>Pricing tiers are unlocked as more participants join</li>
                    <li>Orders that don't meet thresholds by deadline are automatically cancelled</li>
                    <li>Participants are only charged when orders are confirmed</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Participant Responsibilities</h3>
                  <p className="text-muted-foreground mb-4">
                    As a group order participant, you agree to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Provide accurate delivery and contact information</li>
                    <li>Pay for your portion of the order when due</li>
                    <li>Coordinate with other participants as needed</li>
                    <li>Accept delivery according to the agreed terms</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Order Organizer Responsibilities</h3>
                  <p className="text-muted-foreground mb-6">
                    If you create a group order, you additionally agree to facilitate coordination 
                    among participants and ensure accurate product information is provided.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">5. Payments and Pricing</h2>
                  
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Payment Processing</h3>
                  <p className="text-muted-foreground mb-4">
                    Payments are processed through secure third-party payment processors. You agree to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Provide valid payment information</li>
                    <li>Pay all charges incurred under your account</li>
                    <li>Accept responsibility for any payment processing fees</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Pricing and Fees</h3>
                  <p className="text-muted-foreground mb-4">
                    Pricing is determined by:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Product costs from suppliers</li>
                    <li>Bulk discount tiers based on order volume</li>
                    <li>Delivery and handling fees</li>
                    <li>Platform service fees (clearly disclosed)</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Refunds and Cancellations</h3>
                  <p className="text-muted-foreground mb-6">
                    Refunds are provided when group orders are cancelled due to insufficient 
                    participation. Once an order is confirmed and processed, refunds are subject 
                    to the specific product's return policy.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">6. Delivery and Fulfillment</h2>
                  
                  <p className="text-muted-foreground mb-4">
                    Delivery terms vary by group order and may include:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Individual delivery to participant addresses</li>
                    <li>Central pickup locations</li>
                    <li>Coordinated group delivery</li>
                  </ul>
                  
                  <p className="text-muted-foreground mb-6">
                    We work with trusted delivery partners but are not responsible for delays 
                    or issues beyond our control. Estimated delivery times are provided in good 
                    faith but are not guaranteed.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">7. User Conduct</h2>
                  
                  <p className="text-muted-foreground mb-4">
                    You agree not to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Use the platform for any illegal or unauthorized purpose</li>
                    <li>Interfere with or disrupt the platform&apos;s operation</li>
                    <li>Attempt to gain unauthorized access to other accounts</li>
                    <li>Post false, misleading, or inappropriate content</li>
                    <li>Harass, abuse, or harm other users</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">8. Intellectual Property</h2>
                  
                  <p className="text-muted-foreground mb-6">
                    The Sohozdaam platform, including its design, functionality, and content, 
                    is protected by intellectual property laws. You may not copy, modify, 
                    distribute, or create derivative works without our express written permission.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">9. Privacy and Data Protection</h2>
                  
                  <p className="text-muted-foreground mb-6">
                    Your privacy is important to us. Our collection and use of personal information 
                    is governed by our Privacy Policy, which is incorporated into these Terms by reference.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">10. Disclaimers and Limitations</h2>
                  
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Service Availability</h3>
                  <p className="text-muted-foreground mb-4">
                    We strive to maintain platform availability but do not guarantee uninterrupted 
                    service. We may temporarily suspend access for maintenance or updates.
                  </p>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Product Quality</h3>
                  <p className="text-muted-foreground mb-4">
                    While we work with reputable suppliers, we do not warrant the quality, 
                    safety, or fitness of products ordered through the platform. Product 
                    warranties are provided by the respective manufacturers or suppliers.
                  </p>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Limitation of Liability</h3>
                  <p className="text-muted-foreground mb-6">
                    To the maximum extent permitted by law, Sohozdaam shall not be liable for 
                    any indirect, incidental, special, or consequential damages arising from 
                    your use of the platform.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">11. Indemnification</h2>
                  
                  <p className="text-muted-foreground mb-6">
                    You agree to indemnify and hold harmless Sohozdaam from any claims, damages, 
                    or expenses arising from your use of the platform, violation of these Terms, 
                    or infringement of any third-party rights.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">12. Termination</h2>
                  
                  <p className="text-muted-foreground mb-6">
                    We may terminate or suspend your account at any time for violation of these 
                    Terms or for any other reason at our discretion. You may also terminate your 
                    account at any time through your account settings.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">13. Changes to Terms</h2>
                  
                  <p className="text-muted-foreground mb-6">
                    We may update these Terms from time to time. We will notify users of 
                    significant changes through the platform or by email. Continued use of 
                    the platform after changes constitutes acceptance of the updated Terms.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">14. Governing Law</h2>
                  
                  <p className="text-muted-foreground mb-6">
                    These Terms are governed by the laws of [Your Jurisdiction]. Any disputes 
                    arising from these Terms or your use of the platform will be resolved 
                    through binding arbitration or in the courts of [Your Jurisdiction].
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">15. Contact Information</h2>
                  
                  <p className="text-muted-foreground mb-4">
                    If you have questions about these Terms, please contact us:
                  </p>
                  
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <p className="text-muted-foreground mb-2">
                      <strong>Email:</strong> legal@sohozdaam.com
                    </p>
                    <p className="text-muted-foreground mb-2">
                      <strong>Address:</strong> 123 Innovation Drive, Tech City, TC 12345
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Phone:</strong> +1 (555) 123-4567
                    </p>
                  </div>
                </section>

              </div>
            </CardContent>
          </Card>
        </div>
      </MainContainer>
    </PageLayout>
  );
}