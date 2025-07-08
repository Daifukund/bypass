import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SupabaseProvider } from "@/components/supabase-provider";
import { PostHogProvider } from "@/components/posthog-provider";
import "./globals.css";
import { Home, Search, Mail } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bypass - Skip the Job Board Queue",
  description:
    "Stop getting ignored on job applications. Find hiring companies, connect with decision-makers, and get 3.2x more interview invitations.",
};

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Search", href: "/criteria", icon: Search },
  { name: "Find Email", href: "/find-email", icon: Mail },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
        suppressHydrationWarning
      >
        <PostHogProvider>
          <SupabaseProvider>{children}</SupabaseProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
