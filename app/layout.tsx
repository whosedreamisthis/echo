import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation"; // Adjusted if using named export
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Echo",
  description: "A threads clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${interSans.variable} antialiased`}>
      <ClerkProvider>
        <body className="font-sans bg-background text-foreground min-h-full flex flex-col md:flex-row">
          <Navigation />

          <main className="flex-1 pb-16 md:pb-0 p-8">{children}</main>
        </body>
      </ClerkProvider>
    </html>
  );
}
