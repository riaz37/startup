import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth/auth-provider";
import { WebSocketProvider } from "@/contexts/websocket-context";
import { QueryProvider } from "@/providers/query-provider";
import { ResponsiveDebug } from "@/components/common/responsive-debug";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sohozdaam - Group Buying Platform",
  description: "Join group orders and save money on quality products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <WebSocketProvider>
                {children}
                <Toaster />
                <ResponsiveDebug />
              </WebSocketProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
