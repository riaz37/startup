import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";

export default async function PrivacyPage() {
  return (
    <PageLayout>
      <MainContainer>
        <PageHeader
          badge="🔒 Privacy Policy"
          title="Your Privacy Matters"
          highlightedWord="Matters"
          description="We're committed to protecting your privacy and being transparent about how we collect, use, and protect your personal information."
        />
        
        <div className="text-center text-sm text-muted-foreground mb-8">
          Last updated: January 10, 2025
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="card-sohozdaam">
            <CardContent className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                
                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">1. Information We Collect</h2>
                  
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Personal Information</h3>
                  <p className="text-muted-foreground mb-4">
                    When you create an account or use our services, we may collect:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Name and email address</li>
                    <li>Phone number and delivery address</li>
                    <li>Payment information (processed securely by our payment partners)</li>
                    <li>Profile information and preferences</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Usage Information</h3>
                  <p className="text-muted-foreground mb-4">
                    We automatically collect information about how you use our platform:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Pages visited and features used</li>
                    <li>Group orders joined and created</li>
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                  </ul>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">2. How We Use Your Information</h2>
                  
                  <p className="text-muted-foreground mb-4">
                    We use your information to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Provide and improve our group ordering services</li>
                    <li>Process orders and facilitate group purchases</li>
                    <li>Send important updates about your orders and account</li>
                    <li>Provide customer support and respond to inquiries</li>
                    <li>Analyze usage patterns to improve our platform</li>
                    <li>Prevent fraud and ensure platform security</li>
                    <li>Send marketing communications (with your consent)</li>
                  </ul>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">3. Information Sharing</h2>
                  
                  <p className="text-muted-foreground mb-4">
                    We may share your information in the following circumstances:
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3 text-foreground">With Other Group Order Participants</h3>
                  <p className="text-muted-foreground mb-4">
                    When you join a group order, other participants may see your name and 
                    general location (city/region) to facilitate coordination and delivery.
                  </p>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">With Service Providers</h3>
                  <p className="text-muted-foreground mb-4">
                    We work with trusted partners who help us operate our platform:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Payment processors for secure transactions</li>
                    <li>Delivery and logistics partners</li>
                    <li>Cloud hosting and data storage providers</li>
                    <li>Customer support and communication tools</li>
                  </ul>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Legal Requirements</h3>
                  <p className="text-muted-foreground mb-6">
                    We may disclose information when required by law, to protect our rights, 
                    or to ensure the safety and security of our users.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">4. Data Security</h2>
                  
                  <p className="text-muted-foreground mb-4">
                    We implement industry-standard security measures to protect your information:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security audits and monitoring</li>
                    <li>Secure payment processing through certified partners</li>
                    <li>Access controls and employee training</li>
                    <li>Regular backups and disaster recovery procedures</li>
                  </ul>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">5. Your Rights and Choices</h2>
                  
                  <p className="text-muted-foreground mb-4">
                    You have the following rights regarding your personal information:
                  </p>
                  
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Access and Portability</h3>
                  <p className="text-muted-foreground mb-4">
                    You can access and download your personal data through your account settings.
                  </p>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Correction and Updates</h3>
                  <p className="text-muted-foreground mb-4">
                    You can update your personal information at any time through your profile.
                  </p>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Deletion</h3>
                  <p className="text-muted-foreground mb-4">
                    You can request deletion of your account and personal data, subject to 
                    legal and operational requirements.
                  </p>

                  <h3 className="text-xl font-semibold mb-3 text-foreground">Marketing Communications</h3>
                  <p className="text-muted-foreground mb-6">
                    You can opt out of marketing emails at any time using the unsubscribe 
                    link or through your account preferences.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">6. Cookies and Tracking</h2>
                  
                  <p className="text-muted-foreground mb-4">
                    We use cookies and similar technologies to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-1">
                    <li>Remember your preferences and login status</li>
                    <li>Analyze site usage and performance</li>
                    <li>Provide personalized content and recommendations</li>
                    <li>Enable social media features</li>
                  </ul>
                  
                  <p className="text-muted-foreground mb-6">
                    You can control cookie settings through your browser preferences, though 
                    some features may not work properly if cookies are disabled.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">7. Children&apos;s Privacy</h2>
                  
                  <p className="text-muted-foreground mb-6">
                    Our services are not intended for children under 13 years of age. We do not 
                    knowingly collect personal information from children under 13. If we become 
                    aware that we have collected such information, we will take steps to delete it.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">8. International Data Transfers</h2>
                  
                  <p className="text-muted-foreground mb-6">
                    Your information may be transferred to and processed in countries other than 
                    your own. We ensure appropriate safeguards are in place to protect your data 
                    in accordance with applicable privacy laws.
                  </p>
                </section>

                <section className="mb-12">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">9. Changes to This Policy</h2>
                  
                  <p className="text-muted-foreground mb-6">
                    We may update this privacy policy from time to time. We will notify you of 
                    significant changes by email or through our platform. Your continued use of 
                    our services after such changes constitutes acceptance of the updated policy.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4 text-foreground">10. Contact Us</h2>
                  
                  <p className="text-muted-foreground mb-4">
                    If you have questions about this privacy policy or our data practices, 
                    please contact us:
                  </p>
                  
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <p className="text-muted-foreground mb-2">
                      <strong>Email:</strong> privacy@sohozdaam.com
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