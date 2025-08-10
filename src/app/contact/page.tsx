import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { ContactForm, ContactInfo } from "@/components/contact";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ContactPage() {
  return (
    <PageLayout>
      <MainContainer>
        <PageHeader
          badge="💬 Get in Touch"
          title="We're Here to Help You"
          highlightedWord="Help You"
          description="Have questions about group orders? Need support? Want to share feedback? We'd love to hear from you and help make your experience even better."
        />

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
          <ContactInfo />
        </div>

        {/* FAQ Preview */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Common Questions</h2>
            <p className="text-muted-foreground">
              Quick answers to frequently asked questions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="card-hover">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How do group orders work?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Group orders allow multiple people to combine their purchases to reach bulk pricing thresholds and save money together.
                </p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="/help#group-orders">Learn more →</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">When do I get charged?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  You're only charged when the group order reaches its minimum threshold and is confirmed for processing.
                </p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="/help#payments">Learn more →</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What if an order doesn't reach the threshold?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If a group order doesn't reach its minimum threshold by the deadline, it's automatically cancelled and no one is charged.
                </p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="/help#cancellations">Learn more →</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">How is delivery handled?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Products are delivered to individual addresses or a central pickup location, depending on the specific group order setup.
                </p>
                <Button variant="link" className="p-0 h-auto" asChild>
                  <a href="/help#delivery">Learn more →</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainContainer>
    </PageLayout>
  );
}