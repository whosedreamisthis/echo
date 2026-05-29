"use server";

import connectDB from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import Save from "@/models/Save";
import Repost from "@/models/Repost";
import { getPlainPosts } from "@/app/actions/utils"; // 👈 Clean import!
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

// Replace your existing getPosts function with this:
// Add Follow import to the top of your existing file
import Follow from "@/models/Follow";

// app/actions/threads.ts

// app/actions/threads.ts

export async function getPosts(
  currentClerkUserId?: string | null,
  cursor?: { createdAt: string; id: string } | null,
  feedType: "global" | "following" = "following",
) {
  await connectDB();
  const limitValue = 20;

  // 1. Target the logged-in mongo user
  let currentUserDoc = null;
  if (currentClerkUserId) {
    currentUserDoc = await User.findOne({ clerkId: currentClerkUserId });
  }

  // Guard: If on following feed but no user context, exit immediately
  if (feedType === "following" && !currentUserDoc) {
    return { posts: [], nextCursor: null };
  }

  // 2. Build separate query boundaries
  let postFilter: any = { parentId: null };
  let repostFilter: any = {};

  if (cursor) {
    const cursorDate = new Date(cursor.createdAt);
    const cursorId = new mongoose.Types.ObjectId(cursor.id);

    const cursorQuery = {
      $or: [
        { createdAt: { $lt: cursorDate } },
        {
          createdAt: cursorDate,
          _id: { $lt: cursorId },
        },
      ],
    };

    postFilter = { ...postFilter, ...cursorQuery };
    repostFilter = { ...repostFilter, ...cursorQuery };
  }

  let allowedUserIdsStrings: string[] = [];

  // ⚡ IRONCLAD SOCIAL GRAPH INTERSECTION
  if (feedType === "following" && currentUserDoc) {
    const followDocuments = await Follow.find({
      followerId: currentUserDoc._id,
    }).lean();

    const followedStrings = followDocuments
      .map((f: any) => f.followingId?.toString())
      .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

    // Combine into pristine string reference list
    allowedUserIdsStrings = [currentUserDoc._id.toString(), ...followedStrings];

    const allowedObjectIds = allowedUserIdsStrings.map(
      (id) => new mongoose.Types.ObjectId(id),
    );

    postFilter.userId = { $in: allowedObjectIds };
    repostFilter.userId = { $in: allowedObjectIds };
  } else if (feedType === "global") {
    // Global feed should show everything but the current user's own native posts
    if (currentUserDoc) {
      const currentUserIdObj = new mongoose.Types.ObjectId(
        currentUserDoc._id.toString(),
      );
      postFilter.userId = { $ne: currentUserIdObj };
      // Note: We ALLOW current user's reposts in global feed if they are relevant.
    }
  }

  // 3. Fetch data across both streams
  const [posts, repostEntries] = await Promise.all([
    Post.find(postFilter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limitValue + 1)
      .populate("userId", "username profilePicture name")
      .lean(),
    Repost.find(repostFilter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limitValue + 1)
      .populate({
        path: "postId",
        populate: [
          { path: "userId", select: "username profilePicture name" },
          { path: "reposts", select: "name username" }, // 👈 New: Fetch all reposters for prioritization
        ],
      })
      .populate("userId", "name username")
      .lean(),
  ]);

  // 4. Transform Reposts into uniform shapes & purge entries from strangers
  const transformedReposts = repostEntries
    .map((entry: any) => {
      if (!entry.postId || !entry.userId || !entry.postId.userId) return null;

      // 🚨 CRITICAL SANITIZATION ENFORCEMENT:
      // If we are on the 'following' feed, ensure the ORIGINAL AUTHOR of the post
      // is also someone you follow. If they aren't, drop the post completely.
      if (feedType === "following") {
        const originalAuthorIdStr = entry.postId.userId._id.toString();
        if (!allowedUserIdsStrings.includes(originalAuthorIdStr)) {
          return null; // Silently filters out strangers' items
        }
      }

      const { _id, userId, createdAt, ...originalPostProps } = entry.postId;

      return {
        ...originalPostProps,
        _id: entry._id.toString(),
        originalPostId: _id.toString(),
        createdAt:
          entry.createdAt instanceof Date
            ? entry.createdAt.toISOString()
            : entry.createdAt,

        userId: {
          _id: userId._id.toString(),
          username: userId.username,
          profilePicture: userId.profilePicture,
          name: userId.name || "",
        },

        isRepost: true,
        reposts: (() => {
          // ⚡ PRIORITIZATION ENGINE:
          // If the post was reposted by multiple people, we want to show someone YOU FOLLOW
          // in the header, even if the 'entry' we fetched was from a specific reposter.
          const allReposters = entry.postId.reposts || [];
          const followedReposter = allReposters.find((r: any) =>
            allowedUserIdsStrings.includes(r._id?.toString()),
          );

          if (followedReposter) {
            return [
              {
                _id: followedReposter._id.toString(),
                name: followedReposter.name,
                username: followedReposter.username,
              },
            ];
          }

          // Fallback to the user of the current Repost entry
          return [
            {
              _id: entry.userId._id.toString(),
              name: entry.userId.name,
              username: entry.userId.username,
            },
          ];
        })(),
      };
    })
    .filter(Boolean);

  // Normalize standard primitive posts securely
  const normalizedNativePosts = posts
    .map((post: any) => {
      if (!post.userId) return null;

      return {
        ...post,
        _id: post._id.toString(),
        createdAt:
          post.createdAt instanceof Date
            ? post.createdAt.toISOString()
            : post.createdAt,
        userId: {
          _id: post.userId._id.toString(),
          username: post.userId.username,
          profilePicture: post.userId.profilePicture,
          name: post.userId.name || "",
        },
        isRepost: false,
        reposts: post.reposts || [],
      };
    })
    .filter(Boolean);

  // 5. Merge, Sort chronologically, and Slice
  const combinedFeed = [...normalizedNativePosts, ...transformedReposts]
    .sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return b._id.toString().localeCompare(a._id.toString());
    })
    .slice(0, limitValue + 1);

  const hasNextPage = combinedFeed.length > limitValue;
  const slicedFeed = hasNextPage
    ? combinedFeed.slice(0, limitValue)
    : combinedFeed;

  // 6. Handle Save States cleanly
  let savedPostIdsStrings: string[] = [];
  if (currentUserDoc && slicedFeed.length > 0) {
    const postIdsForSaveCheck = slicedFeed.map((item: any) =>
      item.originalPostId ? item.originalPostId : item._id.toString(),
    );

    const savedRecords = await Save.find({
      userId: currentUserDoc._id,
      postId: { $in: postIdsForSaveCheck },
    }).distinct("postId");

    savedPostIdsStrings = savedRecords.map((id) => id.toString());
  }

  const postsWithSaveState = slicedFeed.map((post: any) => {
    const idToCompare = post.originalPostId
      ? post.originalPostId
      : post._id.toString();
    return {
      ...post,
      isSaved: savedPostIdsStrings.includes(idToCompare),
    };
  });

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
      return { success: false, error: "User user not found in database." };

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
