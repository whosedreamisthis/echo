// lib/actions/demo.ts
"use server";

import { createClerkClient } from "@clerk/nextjs/server";
import connectDB from "lib/db";
import User from "models/User";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

function generateRandomUsername() {
  const adjectives = ["swift", "clever", "bright", "cozy", "bold", "nimble"];
  const nouns = ["coder", "hacker", "builder", "dev", "creator", "geek"];
  const randomNum = Math.floor(1000 + Math.random() * 9000);

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `demo_${adj}_${noun}_${randomNum}`;
}

export async function createEphemeralDemoUser() {
  try {
    await connectDB();

    const username = generateRandomUsername();
    // Use a standard valid TLD (.com) so Clerk's validation passes flawlessly
    const email = `${username}@demoapp.com`;
    const password = Math.random().toString(36) + "Ab1!";

    const displayName = username
      .replace("demo_", "Demo ")
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    // 1. Create the user in Clerk programmatically
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      username: username,
      password: password,
    });

    // 2. Sync the new Clerk user to your MongoDB database
    await User.create({
      clerkId: clerkUser.id,
      username: username,
      email: email,
      name: displayName,
      bio: "Checking out this awesome Threads clone! 🚀",
      website: "https://github.com",
      profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    });

    // 3. Create a unique Sign-In Token valid for 1 minute
    const signInToken = await clerkClient.signInTokens.createSignInToken({
      userId: clerkUser.id,
      expiresInSeconds: 60,
    });

    return { success: true, token: signInToken.url };
  } catch (error) {
    console.error("Failed to create demo user:", error);
    return { success: false, error: "Could not initialize demo session." };
  }
}
