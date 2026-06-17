import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TheViralFindsMY — Shopee Affiliate Manager Pro",
  description:
    "The only AI-powered platform built exclusively for Malaysian Shopee affiliates. Discover trending products, generate Manglish-perfect captions, and track every commission in real-time.",
  keywords: [
    "Shopee affiliate",
    "Malaysia affiliate",
    "affiliate marketing",
    "TheViralFindsMY",
    "HERMES AI",
    "Manglish content",
  ],
  authors: [{ name: "TheViralFindsMY" }],
  openGraph: {
    title: "TheViralFindsMY — Shopee Affiliate Manager Pro",
    description: "AI-powered affiliate manager for Malaysian Shopee affiliates.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
