import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle } from "lucide-react";

export function ContactForm() {
  return (
    <Card className="card-sohozdaam">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="h-6 w-6 text-primary mr-2" />
          Send us a Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Your full name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="your@email.com" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" placeholder="What's this about?" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select 
            id="category" 
            className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">Select a category</option>
            <option value="support">General Support</option>
            <option value="order">Order Issues</option>
            <option value="payment">Payment Questions</option>
            <option value="feature">Feature Request</option>
            <option value="bug">Bug Report</option>
            <option value="partnership">Partnership Inquiry</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea 
            id="message" 
            placeholder="Tell us more about your question or feedback..."
            rows={6}
          />
        </div>
        
        <Button className="w-full" size="lg">
          Send Message
        </Button>
        
        <p className="text-sm text-muted-foreground text-center">
          We typically respond within 24 hours during business days.
        </p>
      </CardContent>
    </Card>
  );
}