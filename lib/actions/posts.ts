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
    .populate("userId", "username profilePicture")
    .lean();

  const plainPosts = posts.map((post: any) => {
    return {
      ...post,
      _id: post._id.toString(),
      userId:
        post.userId && typeof post.userId === "object"
          ? {
              _id: post.userId._id.toString(),
              username: post.userId.username,
              profilePicture: post.userId.profilePicture || null,
            }
          : post.userId,
      // 👇 Don't forget to stringify arrays of ObjectIds and Dates too!
      likes: post.likes?.map((id: any) => id.toString()) || [],
      reposts: post.reposts?.map((id: any) => id.toString()) || [],
      shares: post.shares?.map((id: any) => id.toString()) || [],
      comments:
        post.comments?.map((c: any) => ({
          ...c,
          _id: c._id.toString(),
          userId: c.userId.toString(),
          createdAt: c.createdAt.toISOString(),
        })) || [],
      createdAt: post.createdAt.toISOString(),
    };
  });

  return { posts: plainPosts };
}

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

export async function toggleLike(postId: string) {
  // 1. Authenticate the user via Clerk
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    await connectDB();

    // Ensure models are registered
    const EnsureUserSchema = User || mongoose.model("User");
    const EnsurePostSchema = Post || mongoose.model("Post");

    // 2. Look up the local MongoDB user using the Clerk ID
    let mongoUser = await User.findOne({ clerkId: clerkUserId });
    if (!mongoUser) {
      console.log(
        `✨ Registering missing user profile for Clerk ID: ${clerkUserId}`,
      );
      mongoUser = await User.create({
        clerkId: clerkUserId,
        username: `demo_user_${Math.random().toString(36).substring(2, 7)}`,
        email: `demo-${clerkUserId}@example.com`,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${clerkUserId}`,
      });
    }

    if (!mongoUser) {
      return { success: false, error: "User profile not found in database." };
    }

    // 3. Find the post to check if the user has already liked it
    const post = await Post.findById(postId);
    if (!post) {
      return { success: false, error: "Post not found." };
    }

    // Check if the user's MongoDB _id exists in the likes array
    const hasLiked = post.likes.includes(mongoUser._id);

    if (hasLiked) {
      // 🍉 If already liked, remove them from the array ($pull)
      await Post.findByIdAndUpdate(postId, {
        $pull: { likes: mongoUser._id },
      });
    } else {
      // 🍉 If not liked, atomically add them ($addToSet prevents duplicates)
      await Post.findByIdAndUpdate(postId, {
        $addToSet: { likes: mongoUser._id },
      });
    }

    // 4. Revalidate the home path so the UI reflects the updated count immediately
    revalidatePath("/");

    return { success: true, hasLiked: !hasLiked };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
