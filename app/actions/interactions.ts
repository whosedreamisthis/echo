"use server";
import mongoose from "mongoose";
import User from "@/models/User";
import Post from "@/models/Post";
import Save from "@/models/Save";
import connectDB from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

export async function toggleLike(postId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "User not authenticated" };

  try {
    await connectDB();
    const EnsureUserSchema = User || mongoose.model("User");
    const EnsurePostSchema = Post || mongoose.model("Post");

    let mongoUser = await User.findOne({ clerkId: clerkUserId });
    if (!mongoUser) {
      mongoUser = await User.create({
        clerkId: clerkUserId,
        username: `demo_user_${Math.random().toString(36).substring(2, 7)}`,
        email: `demo-${clerkUserId}@example.com`,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${clerkUserId}`,
      });
    }

    const post = await Post.findById(postId);
    if (!post) return { success: false, error: "Post not found." };

    const hasLiked = post.likes.includes(mongoUser._id);
    if (hasLiked) {
      await Post.findByIdAndUpdate(postId, { $pull: { likes: mongoUser._id } });
    } else {
      await Post.findByIdAndUpdate(postId, {
        $addToSet: { likes: mongoUser._id },
      });
    }

    revalidatePath("/");
    return { success: true, hasLiked: !hasLiked };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleSavePost(postId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "User not authenticated" };

  await connectDB();
  const mongoUser = await User.findOne({ clerkId: clerkUserId });
  if (!mongoUser)
    return { success: false, error: "User user not found in database." };

  try {
    const currentUserId = mongoUser._id;
    const existingSave = await Save.findOne({ userId: currentUserId, postId });

    if (existingSave) {
      await Save.findByIdAndDelete(existingSave._id);
      revalidatePath("/");
      return { saved: false, message: "Post unsaved" };
    }

    const newSave = new Save({ userId: currentUserId, postId });
    await newSave.save();

    revalidatePath("/");
    return { saved: true, message: "Post saved successfully" };
  } catch (error: any) {
    console.error("Save action error:", error);
    return { error: error.message || "Something went wrong" };
  }
}

export async function getSavedPosts(page: number = 1) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { posts: [], error: "User not authenticated" };

  await connectDB();
  const mongoUser = await User.findOne({ clerkId: clerkUserId });
  if (!mongoUser)
    return { posts: [], error: "User user not found in database." };

  try {
    const currentUserId = mongoUser._id;
    const limit = 10;

    const savedItems = await Save.find({ userId: currentUserId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: "postId",
        populate: {
          path: "userId",
          select: "name username avatar profilePicture",
        },
      });

    const posts = savedItems
      .filter((item) => item.postId !== null)
      .map((item) => {
        const itemObj = JSON.parse(JSON.stringify(item.postId));
        // Everything returned in this query is inherently saved
        return { ...itemObj, isSaved: true };
      });

    return { posts };
  } catch (error: any) {
    console.error("Get saved posts error:", error);
    return { error: error.message, posts: [] };
  }
}
