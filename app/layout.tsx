import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaSetup } from "./install-mims";
import "./globals.css";
import "./mims-desktop.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "MIMS",
  title: "MIMS — Freelance pricing & deal estimates",
  description:
    "Educational pricing and deal-prep estimates for independent creative freelancers — not legal or contract advice.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/mims-icon.svg",
    apple: "/mims-icon.svg",
  },
  appleWebApp: { capable: true, title: "MIMS", statusBarStyle: "black-translucent" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B0B0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <PwaSetup />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
