import type { Metadata } from "next";
import { Bebas_Neue, Geist, Geist_Mono } from "next/font/google";
import { PlausibleAnalytics } from "@/components/PlausibleAnalytics";
import { VercelAnalytics } from "@/components/VercelAnalytics";
import { VisitorBeacon } from "@/components/VisitorBeacon";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toronto World Cup Bars 2026",
  description:
    "Find the best Toronto bars to watch World Cup 2026 — filter by cover, audio, and walk-in access on an interactive map.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} font-sans antialiased`}
      >
        <PlausibleAnalytics />
        <VercelAnalytics />
        <VisitorBeacon />
        {children}
      </body>
    </html>
  );
}
