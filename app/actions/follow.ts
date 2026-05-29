"use server";

import connectDB from "@/lib/db";
import User from "@/models/User";
import Follow from "@/models/Follow";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function toggleFollow(targetUserId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Authentication required" };

  try {
    await connectDB();

    // 1. Resolve current user's DB doc
    const currentUser = await User.findOne({ clerkId: clerkUserId });
    if (!currentUser) return { success: false, error: "User not found" };

    // Prevent self-following
    if (currentUser._id.toString() === targetUserId) {
      return { success: false, error: "You cannot follow yourself" };
    }

    // 2. Check if already following
    const existingFollow = await Follow.findOne({
      followerId: currentUser._id,
      followingId: targetUserId,
    });

    if (existingFollow) {
      // Unfollow
      await Follow.deleteOne({ _id: existingFollow._id });
      revalidatePath(`/profile/${targetUserId}`);
      return { success: true, isFollowing: false };
    } else {
      // Follow
      await Follow.create({
        followerId: currentUser._id,
        followingId: targetUserId,
      });
      revalidatePath(`/profile/${targetUserId}`);
      return { success: true, isFollowing: true };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
