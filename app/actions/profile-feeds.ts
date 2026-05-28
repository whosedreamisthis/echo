"use server";

import connectDB from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import Save from "@/models/Save";
import Repost from "@/models/Repost";
import { getPlainPosts } from "@/app/actions/utils";
import mongoose from "mongoose";
import { auth } from "@clerk/nextjs/server";

export async function getUserProfileFeed(
  profileUserId: string,
  cursor?: { createdAt: string; id: string } | null,
  type: "posts" | "reposts" | "replies" = "posts",
) {
  await connectDB();
  const limitValue = 20;
  const userObjectId = new mongoose.Types.ObjectId(profileUserId);

  // 1. Build the base chronological cursor query if it exists
  let cursorFilter: any = {};
  if (cursor) {
    cursorFilter.$or = [
      { createdAt: { $lt: new Date(cursor.createdAt) } },
      {
        createdAt: new Date(cursor.createdAt),
        _id: { $lt: new mongoose.Types.ObjectId(cursor.id) },
      },
    ];
  }

  let posts: any[] = [];
  let hasNextPage = false;
  let nextCursorData: { createdAt: Date | string; _id: string } | null = null;

  // 2. Branch out ONLY the data fetching layer
  if (type === "reposts") {
    // 🔄 Query Repost collection
    const repostEntries = await Repost.find({
      userId: userObjectId,
      ...cursorFilter,
    })
      .sort({ createdAt: -1, _id: -1 })
      .limit(limitValue + 1)
      .populate({
        path: "postId",
        populate: { path: "userId", select: "username profilePicture" },
      })
      .lean();

    hasNextPage = repostEntries.length > limitValue;
    const slicedEntries = hasNextPage
      ? repostEntries.slice(0, limitValue)
      : repostEntries;

    // Extract the nested populated posts
    posts = slicedEntries.map((entry: any) => entry.postId).filter(Boolean);

    // Track cursor from the Repost document timestamps, not the original post
    if (slicedEntries.length > 0) {
      const lastEntry = slicedEntries[slicedEntries.length - 1];
      nextCursorData = {
        createdAt: lastEntry.createdAt,
        _id: lastEntry._id.toString(),
      };
    }
  } else {
    // 🧵/💬 Query Post collection (posts or replies)
    const postFilter: any = {
      userId: userObjectId,
      parentId: type === "posts" ? null : { $ne: null },
      ...cursorFilter,
    };

    const fetchedPosts = await Post.find(postFilter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limitValue + 1)
      .populate("userId", "username profilePicture")
      .lean();

    hasNextPage = fetchedPosts.length > limitValue;
    posts = hasNextPage ? fetchedPosts.slice(0, limitValue) : fetchedPosts;

    if (posts.length > 0) {
      const lastPost = posts[posts.length - 1];
      nextCursorData = {
        createdAt: lastPost.createdAt,
        _id: lastPost._id.toString(),
      };
    }
  }

  // 3. Fully Shared Logic (Save States & Serialization)
  if (posts.length === 0) return { posts: [], nextCursor: null };

  const { userId: clerkUserId } = await auth();
  let savedPostIdsStrings: string[] = [];

  if (clerkUserId) {
    const currentUserDoc = await User.findOne({ clerkId: clerkUserId });
    if (currentUserDoc) {
      savedPostIdsStrings = await Save.find({
        userId: currentUserDoc._id,
        postId: { $in: posts.map((p) => p._id) },
      })
        .distinct("postId")
        .then((records) => records.map((id) => id.toString()));
    }
  }

  const postsWithSaveState = posts.map((post) => ({
    ...post,
    isSaved: savedPostIdsStrings.includes(post._id.toString()),
  }));

  const plainPosts = getPlainPosts(postsWithSaveState);

  // Formulate the finalized cursor output for Next.js infinite scrolling
  const nextCursor =
    hasNextPage && nextCursorData
      ? {
          createdAt:
            nextCursorData.createdAt instanceof Date
              ? nextCursorData.createdAt.toISOString()
              : nextCursorData.createdAt,
          id: nextCursorData._id,
        }
      : null;

  return { posts: plainPosts, nextCursor };
}
