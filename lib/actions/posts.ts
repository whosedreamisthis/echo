"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
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
      // 👇 Don't forget to stringify arrays of ObjectIds and Dates too!
      likes: post.likes?.map((id: any) => id.toString()) || [],
      reposts: post.reposts?.map((id: any) => id.toString()) || [],
      shares: post.shares?.map((id: any) => id.toString()) || [],
      commentCount: post.commentCount || 0,
      createdAt: post.createdAt.toISOString(),
    };
  });
}

// 🍉 Pass the optional currentClerkUserId into the function
// lib/actions/posts.ts

export async function getPosts(
  currentClerkUserId?: string | null,
  cursor?: { createdAt: string; id: string } | null, // 🍉 Accept a compound object
) {
  await connectDB();
  const EnsureUserSchema = User || mongoose.model("User");

  let queryFilter: any = { parentId: null };

  // 🍉 Tie-breaker query logic
  if (cursor) {
    queryFilter.$or = [
      { createdAt: { $lt: new Date(cursor.createdAt) } },
      {
        createdAt: new Date(cursor.createdAt),
        _id: { $lt: new mongoose.Types.ObjectId(cursor.id) },
      },
    ];
  }

  if (currentClerkUserId) {
    const currentUserDoc = await User.findOne({ clerkId: currentClerkUserId });
    if (currentUserDoc) {
      queryFilter = { ...queryFilter, userId: { $ne: currentUserDoc._id } };
    }
  }

  const limitValue = 20;

  // 🍉 Ensure you sort by BOTH fields to keep the database performance stable
  const posts = await Post.find(queryFilter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(limitValue + 1)
    .populate("userId", "username profilePicture")
    .lean();

  const hasNextPage = posts.length > limitValue;
  const slicedPosts = hasNextPage ? posts.slice(0, limitValue) : posts;
  const plainPosts = getPlainPosts(slicedPosts);

  // 🍉 Construct the compound next cursor from the final element
  let nextCursor = null;
  if (hasNextPage && plainPosts.length > 0) {
    const lastPost = plainPosts[plainPosts.length - 1];
    nextCursor = {
      createdAt: lastPost.createdAt, // This is already an ISO string from getPlainPosts
      id: lastPost._id,
    };
  }

  return { posts: plainPosts, nextCursor };
}

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

  if (currentClerkUserId) {
    const currentUserDoc = await User.findOne({ clerkId: currentClerkUserId });
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
  const plainPosts = getPlainPosts(slicedPosts);

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

  // Force the bundler to keep the registration by referencing it explicitly
  const EnsureUserSchema = User || mongoose.model("User");

  // 1. Initialize an empty query filter object
  let queryFilter: any = {
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

// lib/actions/posts.ts
// lib/actions/posts.ts
// lib/actions/posts.ts
export async function getPostById(postId: string) {
  await connectDB();

  const EnsureUserSchema = User || mongoose.model("User");
  const EnsurePostSchema = Post || mongoose.model("Post");

  try {
    // 1. Fetch the target post and its recursive ancestors
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

    // 2. Fetch the comments (replies) belonging to the target post
    const commentsRaw = await Post.find({
      parentId: new mongoose.Types.ObjectId(postId),
    })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: 1 })
      .lean();

    // 🍉 FIX: Get the target post's userId AND all ancestor userIds to populate everything at once
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

    // 🍉 FIX: Re-attach user data to the target post itself
    const mainPostUserIdStr = targetPostRaw.userId.toString();
    targetPostRaw.userId =
      userMap.get(mainPostUserIdStr) || targetPostRaw.userId;

    // Re-attach user data to each ancestor item
    const populatedAncestors = targetPostRaw.rawAncestors.map(
      (ancestor: any) => ({
        ...ancestor,
        userId: userMap.get(ancestor.userId.toString()) || ancestor.userId,
      }),
    );

    // 3. Sort ancestors chronologically
    const orderedAncestors = populatedAncestors.sort((a: any, b: any) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // 4. Standard serializer to handle plain object transformations
    const serializePost = (p: any) => ({
      ...p,
      _id: p._id.toString(),
      parentId: p.parentId ? p.parentId.toString() : null,
      userId:
        p.userId && typeof p.userId === "object"
          ? {
              ...p.userId,
              _id: p.userId._id.toString(),
            }
          : p.userId,
      likes: p.likes?.map((id: any) => id.toString()) || [],
      reposts: p.reposts?.map((id: any) => id.toString()) || [],
      shares: p.shares?.map((id: any) => id.toString()) || [],
      commentCount: p.commentCount || 0,
      createdAt:
        p.createdAt instanceof Date
          ? p.createdAt.toISOString()
          : new Date(p.createdAt).toISOString(),
    });

    // Strip raw array off target before wrapping
    const { rawAncestors, ...cleanTargetPost } = targetPostRaw;

    const plainPost = serializePost(cleanTargetPost);
    const plainComments = commentsRaw.map(serializePost);
    const plainAncestors = orderedAncestors.map(serializePost);

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
      parentId,
    });

    if (parentId) {
      await Post.findByIdAndUpdate(parentId, {
        $inc: { commentCount: 1 },
      });

      // Revalidate the individual dynamic post page if you have one (e.g., /echo/[id])
      revalidatePath(`/posts/${parentId}`);
    }

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
