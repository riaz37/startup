import Link from "next/link";
import { PageLayout, PageHeader, MainContainer } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, User } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <PageLayout>
      <MainContainer>
        <div className="max-w-md mx-auto">
          <Card className="card-sohozdaam text-center">
            <CardContent className="pt-12 pb-12">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10 mb-6">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Access Denied
              </h2>
              <p className="text-muted-foreground mb-8">
                You don&apos;t have permission to access this page. Please contact support if you believe this is an error.
              </p>
              
              <div className="space-y-4">
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainContainer>
    </PageLayout>
  );
}