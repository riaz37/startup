import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  HelpCircle,
  Bug,
  Lightbulb
} from "lucide-react";

export function ContactInfo() {
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <Card className="card-sohozdaam">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-medium">Email Support</div>
              <div className="text-sm text-muted-foreground">support@sohozdaam.com</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Phone className="h-5 w-5 text-secondary mt-0.5" />
            <div>
              <div className="font-medium">Phone Support</div>
              <div className="text-sm text-muted-foreground">+1 (555) 123-4567</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <div className="font-medium">Office</div>
              <div className="text-sm text-muted-foreground">
                123 Innovation Drive<br />
                Tech City, TC 12345
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-medium">Business Hours</div>
              <div className="text-sm text-muted-foreground">
                Mon-Fri: 9:00 AM - 6:00 PM<br />
                Sat-Sun: 10:00 AM - 4:00 PM
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-sohozdaam">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="/help">
              <HelpCircle className="h-4 w-4 mr-2" />
              Browse Help Center
            </a>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="mailto:bugs@sohozdaam.com">
              <Bug className="h-4 w-4 mr-2" />
              Report a Bug
            </a>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <a href="mailto:feedback@sohozdaam.com">
              <Lightbulb className="h-4 w-4 mr-2" />
              Share Feedback
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Response Time */}
      <Card className="card-sohozdaam">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-2"> 24h</div>
            <div className="text-sm text-muted-foreground">
              Average response time for support requests
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}