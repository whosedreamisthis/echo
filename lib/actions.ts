// app/actions.ts
"use server";
import connectDB from "@/lib/db";
import Post from "../models/Post";
import User from "../models/User";
import { auth } from "@clerk/nextjs/server";

export async function createEcho(content: string) {
  const { userId } = await auth();

  try {
    // Establish connection to echoCluster
    await connectDB();
    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    // Insert the new post document into MongoDB
    const newPost = await Post.create({
      userId,
      content,
    });

    return { success: true, post: JSON.parse(JSON.stringify(newPost)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
