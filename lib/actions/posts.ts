"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import Save from "@/models/Save";
import mongoose from "mongoose";
import { PostType } from "@/lib/types";

function getPlainPosts(posts: PostType[]) {
  return posts.map((post: any) => {
    return {
      ...post,
      _id: post._id.toString(),
      parentId: post.parentId ? post.parentId.toString() : null,
      userId:
        post.userId && typeof post.userId === "object"
          ? {
              _id: post.userId._id.toString(),
              username: post.userId.username,
              profilePicture: post.userId.profilePicture || null,
            }
          : post.userId,
      likes: post.likes?.map((id: any) => id.toString()) || [],
      reposts: post.reposts?.map((id: any) => id.toString()) || [],
      shares: post.shares?.map((id: any) => id.toString()) || [],
      commentCount: post.commentCount || 0,
      createdAt:
        post.createdAt instanceof Date
          ? post.createdAt.toISOString()
          : post.createdAt,
      // ⚡ FIX 1: Pass along our calculated save boolean flag through the plain serializer wrapper
      isSaved: !!post.isSaved,
    };
  });
}

// Replace your existing getPosts function with this:
export async function getPosts(
  currentClerkUserId?: string | null,
  cursor?: { createdAt: string; id: string } | null,
) {
  await connectDB();
  const EnsureUserSchema = User || mongoose.model("User");

  let queryFilter: any = { parentId: null };

  if (cursor) {
    queryFilter.$or = [
      { createdAt: { $lt: new Date(cursor.createdAt) } },
      {
        createdAt: new Date(cursor.createdAt),
        _id: { $lt: new mongoose.Types.ObjectId(cursor.id) },
      },
    ];
  }

  // ⚡ FIX: Find the local MongoDB user document first
  let currentUserDoc = null;
  if (currentClerkUserId) {
    currentUserDoc = await User.findOne({ clerkId: currentClerkUserId });
    if (currentUserDoc) {
      // Exclude the user's own posts from the feed if that's your goal
      queryFilter = { ...queryFilter, userId: { $ne: currentUserDoc._id } };
    }
  }

  const limitValue = 20;

  const posts = await Post.find(queryFilter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limitValue + 1)
    .populate("userId", "username profilePicture")
    .lean();

  const hasNextPage = posts.length > limitValue;
  const slicedPosts = hasNextPage ? posts.slice(0, limitValue) : posts;

  let savedPostIdsStrings: string[] = [];

  // ⚡ FIX: Query the Save collection using the MongoDB ObjectId (_id), NOT the clerkId string
  if (currentUserDoc) {
    const savedRecords = await Save.find({
      userId: currentUserDoc._id, // ✅ Correctly matches the format in your DB
      postId: { $in: slicedPosts.map((p) => p._id) },
    }).distinct("postId");

    savedPostIdsStrings = savedRecords.map((id) => id.toString());
  }

  const postsWithSaveState = slicedPosts.map((post) => ({
    ...post,
    isSaved: savedPostIdsStrings.includes(post._id.toString()),
  }));

  const plainPosts = getPlainPosts(postsWithSaveState);

  let nextCursor = null;
  if (hasNextPage && plainPosts.length > 0) {
    const lastPost = plainPosts[plainPosts.length - 1];
    nextCursor = {
      createdAt: lastPost.createdAt,
      id: lastPost._id,
    };
  }

  return { posts: plainPosts, nextCursor };
}

// Replace your existing searchPosts function with this:
export async function searchPosts(
  query: string,
  currentClerkUserId?: string | null,
  cursor?: { createdAt: string; id: string } | null,
) {
  if (!query) return { posts: [], nextCursor: null };

  await connectDB();
  const EnsureUserSchema = User || mongoose.model("User");

  let queryFilter: any = {
    parentId: null,
    content: { $regex: query, $options: "i" },
  };

  if (cursor) {
    queryFilter.$or = [
      { createdAt: { $lt: new Date(cursor.createdAt) } },
      {
        createdAt: new Date(cursor.createdAt),
        _id: { $lt: new mongoose.Types.ObjectId(cursor.id) },
      },
    ];
  }

  // ⚡ FIX: Apply the same MongoDB User doc lookup here
  let currentUserDoc = null;
  if (currentClerkUserId) {
    currentUserDoc = await User.findOne({ clerkId: currentClerkUserId });
    if (currentUserDoc) {
      queryFilter = { ...queryFilter, userId: { $ne: currentUserDoc._id } };
    }
  }

  const limitValue = 20;

  const posts = await Post.find(queryFilter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limitValue + 1)
    .populate("userId", "username profilePicture")
    .lean();

  const hasNextPage = posts.length > limitValue;
  const slicedPosts = hasNextPage ? posts.slice(0, limitValue) : posts;

  let savedPostIdsStrings: string[] = [];

  // ⚡ FIX: Use the MongoDB _id here too
  if (currentUserDoc) {
    const savedRecords = await Save.find({
      userId: currentUserDoc._id, // ✅ Correct format pointer
      postId: { $in: slicedPosts.map((p) => p._id) },
    }).distinct("postId");

    savedPostIdsStrings = savedRecords.map((id) => id.toString());
  }

  const postsWithSaveState = slicedPosts.map((post) => ({
    ...post,
    isSaved: savedPostIdsStrings.includes(post._id.toString()),
  }));

  const plainPosts = getPlainPosts(postsWithSaveState);

  let nextCursor = null;
  if (hasNextPage && plainPosts.length > 0) {
    const lastPost = plainPosts[plainPosts.length - 1];
    nextCursor = {
      createdAt: lastPost.createdAt,
      id: lastPost._id,
    };
  }

  return { posts: plainPosts, nextCursor };
}

export async function getPostsWithParent(parentId: string) {
  await connectDB();
  const EnsureUserSchema = User || mongoose.model("User");

  const queryFilter: any = {
    parentId: new mongoose.Types.ObjectId(parentId),
  };

  const posts = await Post.find(queryFilter)
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("userId", "username profilePicture")
    .lean();

  const plainPosts = getPlainPosts(posts);
  return { posts: plainPosts };
}

export async function getPostById(postId: string) {
  await connectDB();
  const EnsureUserSchema = User || mongoose.model("User");
  const EnsurePostSchema = Post || mongoose.model("Post");

  const { userId: clerkUserId } = await auth();
  let currentUserDoc = null;
  if (clerkUserId) {
    currentUserDoc = await User.findOne({ clerkId: clerkUserId });
  }

  try {
    const aggregationResults = await Post.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postId) } },
      {
        $graphLookup: {
          from: "posts",
          startWith: "$parentId",
          connectFromField: "parentId",
          connectToField: "_id",
          as: "rawAncestors",
        },
      },
    ]);

    if (!aggregationResults.length) return { post: null, ancestors: [] };

    const targetPostRaw = aggregationResults[0];

    const commentsRaw = await Post.find({
      parentId: new mongoose.Types.ObjectId(postId),
    })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: 1 })
      .lean();

    const allUserIds = [
      targetPostRaw.userId,
      ...targetPostRaw.rawAncestors.map((a: any) => a.userId),
    ];

    const populatedUsers = await User.find(
      { _id: { $in: allUserIds } },
      "username profilePicture",
    ).lean();
    const userMap = new Map(
      populatedUsers.map((u: any) => [u._id.toString(), u]),
    );

    const mainPostUserIdStr = targetPostRaw.userId.toString();
    targetPostRaw.userId =
      userMap.get(mainPostUserIdStr) || targetPostRaw.userId;

    const populatedAncestors = targetPostRaw.rawAncestors.map(
      (ancestor: any) => ({
        ...ancestor,
        userId: userMap.get(ancestor.userId.toString()) || ancestor.userId,
      }),
    );

    const orderedAncestors = populatedAncestors.sort((a: any, b: any) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // Gather all post IDs present inside this detailed view to do a single aggregated Save call
    let savedPostIdsStrings: string[] = [];
    if (currentUserDoc) {
      const allTargetPostIds = [
        targetPostRaw._id,
        ...commentsRaw.map((c) => c._id),
        ...orderedAncestors.map((a: any) => a._id),
      ];
      const savedRecords = await Save.find({
        userId: currentUserDoc._id,
        postId: { $in: allTargetPostIds },
      }).distinct("postId");
      savedPostIdsStrings = savedRecords.map((id) => id.toString());
    }

    // ... (Keep the top half of getPostById exactly the same, down to where savedPostIdsStrings is computed)

    // 1. Define your serialization helper (Ensure it handles reading the pre-mapped isSaved flag)
    const serializePost = (p: any) => ({
      ...p,
      _id: p._id.toString(),
      parentId: p.parentId ? p.parentId.toString() : null,
      userId:
        p.userId && typeof p.userId === "object"
          ? { ...p.userId, _id: p.userId._id.toString() }
          : p.userId,
      likes: p.likes?.map((id: any) => id.toString()) || [],
      reposts: p.reposts?.map((id: any) => id.toString()) || [],
      shares: p.shares?.map((id: any) => id.toString()) || [],
      commentCount: p.commentCount || 0,
      createdAt:
        p.createdAt instanceof Date
          ? p.createdAt.toISOString()
          : new Date(p.createdAt).toISOString(),
      // ⚡ Keeps whatever was mapped, or falls back to checking the aggregation array
      isSaved:
        p.isSaved !== undefined
          ? p.isSaved
          : savedPostIdsStrings.includes(p._id.toString()),
    });

    // 2. Strip raw array off the main target post
    const { rawAncestors, ...cleanTargetPost } = targetPostRaw;

    // ⚡ FIX: Map over the raw comments array and explicitly inject the true/false save state
    // BEFORE passing them to serializePost!
    const commentsWithSaveState = commentsRaw.map((comment) => ({
      ...comment,
      isSaved: savedPostIdsStrings.includes(comment._id.toString()),
    }));

    // ⚡ FIX: Apply the exact same logic to your ancestors array so they don't break either!
    const ancestorsWithSaveState = orderedAncestors.map((ancestor: any) => ({
      ...ancestor,
      isSaved: savedPostIdsStrings.includes(ancestor._id.toString()),
    }));

    // 3. Serialize everything cleanly for your Client Components
    const plainPost = serializePost(cleanTargetPost);
    const plainComments = commentsWithSaveState.map(serializePost);
    const plainAncestors = ancestorsWithSaveState.map(serializePost);

    return {
      post: { ...plainPost, comments: plainComments },
      ancestors: plainAncestors,
    };
  } catch (error) {
    console.error("Error loading deep link ancestors:", error);
    return { post: null, ancestors: [] };
  }
}

export async function createEcho(
  content: string,
  parentId: string | null = null,
) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "User not authenticated" };

  try {
    await connectDB();
    const EnsureUserSchema = User || mongoose.model("User");

    const mongoUser = await User.findOne({ clerkId: clerkUserId });
    if (!mongoUser)
      return { success: false, error: "User profile not found in database." };

    const newPost = await Post.create({
      userId: mongoUser._id,
      content,
      parentId,
    });

    if (parentId) {
      await Post.findByIdAndUpdate(parentId, { $inc: { commentCount: 1 } });
      revalidatePath(`/post/${parentId}`);
    }

    revalidatePath("/");
    return { success: true, post: JSON.parse(JSON.stringify(newPost)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

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
    return { success: false, error: "User profile not found in database." };

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
    return { posts: [], error: "User profile not found in database." };

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
