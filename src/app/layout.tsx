import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// const dmSerifText = DM_Serif_Text({
//   subsets: ["latin"],
//   weight: "400", // required for DM Serif Text
//   variable: "--font-dm-serif-text",
// });

export const metadata: Metadata = {
  title: "Build Apps Without Coding – AI Powered",
  description: "Turn your ideas into production-ready Next.js apps with AI. Minder makes app development simple, fast, and code-free.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
