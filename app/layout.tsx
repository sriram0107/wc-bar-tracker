import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PlausibleAnalytics } from "@/components/PlausibleAnalytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Cup Bar Tracker | Toronto",
  description:
    "Curated map of Toronto bars showing the FIFA World Cup — filter by walk-in, cover, and audio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PlausibleAnalytics />
        {children}
      </body>
    </html>
  );
}
