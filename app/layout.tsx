import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation"; // Adjusted if using named export
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { Toaster } from "@/components/ui/sonner";

const interSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Echo",
  description: "A threads clone",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  let databaseProfileImage: string | null = null;
  let username;
  // 2. Look up the user document inside your MongoDB table
  if (userId) {
    await connectDB();

    const dbUser = await User.findOne({ clerkId: userId }).select(
      "profilePicture username",
    );
    if (dbUser?.profilePicture) {
      databaseProfileImage = dbUser.profilePicture;
      console.log(databaseProfileImage);
    }
    console.log("username", dbUser?.username);
    console.log("userId", userId);
    username = dbUser?.username || "";
  }
  return (
    <html lang="en" className={`${interSans.variable} antialiased`}>
      <ClerkProvider>
        <body className="font-sans bg-background text-foreground min-h-full flex flex-col md:flex-row">
          <Navigation
            profileImage={databaseProfileImage || "/user.png"}
            username={username}
          />

          <main className="flex-1 pb-16 sm:pb-0 sm:p-8">
            {children}
            <Toaster
              theme="light"
              richColors
              closeButton
              position="top-right"
            />
          </main>
        </body>
      </ClerkProvider>
    </html>
  );
}
