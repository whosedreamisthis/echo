"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import mongoose from "mongoose";

// 🍉 Pass the optional currentClerkUserId into the function
export async function getPosts(currentClerkUserId?: string | null) {
  await connectDB();

  // Force the bundler to keep the registration by referencing it explicitly
  const EnsureUserSchema = User || mongoose.model("User");

  // 1. Initialize an empty query filter object
  let queryFilter = {};

  if (currentClerkUserId) {
    const currentUserDoc = await User.findOne({ clerkId: currentClerkUserId });

    if (currentUserDoc) {
      // Filter out posts where userId equals the current user's ObjectId ($ne = Not Equal)
      queryFilter = { userId: { $ne: currentUserDoc._id } };
    }
  }

  const posts = await Post.find(queryFilter)
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("userId", "username profilePicture");

  const plainPosts = posts.map((post) => {
    const doc = post.toObject();
    doc._id = doc._id.toString();

    if (doc.userId && typeof doc.userId === "object") {
      doc.userId._id = doc.userId._id.toString();
    }
    return doc;
  });

  return { posts: plainPosts };
}

// app/actions.ts

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
