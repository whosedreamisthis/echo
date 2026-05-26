// app/actions.ts
"use server";
import connectDB from "@/lib/db";
import Post from "../models/Post";
import User from "../models/User";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export async function createEcho(content: string) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    await connectDB();

    // Ensure the User model is registered
    const EnsureUserSchema = User || mongoose.model("User");

    {
      /* 🍉 1. Find the local MongoDB user document using the Clerk ID */
    }
    const mongoUser = await User.findOne({ clerkId: clerkUserId });

    if (!mongoUser) {
      return { success: false, error: "User profile not found in database." };
    }

    {
      /* 🍉 2. Pass the MongoDB _id (ObjectId) instead of the Clerk string */
    }
    const newPost = await Post.create({
      userId: mongoUser._id,
      content,
    });

    revalidatePath("/");
    return { success: true, post: JSON.parse(JSON.stringify(newPost)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
