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

  // 2. If a logged-in user ID is provided, find their local MongoDB ObjectId
  if (currentClerkUserId) {
    const currentUserDoc = await User.findOne({ clerkId: currentClerkUserId });

    if (currentUserDoc) {
      // Filter out posts where userId equals the current user's ObjectId ($ne = Not Equal)
      queryFilter = { userId: { $ne: currentUserDoc._id } };
    }
  }

  // 3. Apply the filter object to the find query
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
