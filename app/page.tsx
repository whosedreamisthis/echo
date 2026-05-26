// app/page.tsx

import DemoButton from "@/components/demo-button";
import { auth } from "@clerk/nextjs/server";
import { getPosts } from "@/lib/actions/posts";
import PostCard from "@/components/post-card";
import Feed from "@/components/feed";
import NewThread from "@/components/new-thread";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";

export default async function Home() {
  const { userId } = await auth();
  const { posts } = await getPosts();

  let mongoProfileImage = "/profile.jpg"; // Default fallback placeholder

  // If a user is logged in, fetch their profile picture from MongoDB
  if (userId) {
    await connectDB();
    // Force registration backup safety check
    const EnsureUserSchema = User || mongoose.model("User");

    const dbUser = await User.findOne({ clerkId: userId }).select(
      "profilePicture",
    );
    if (dbUser?.profilePicture) {
      mongoProfileImage = dbUser.profilePicture;
    }
  }

  return (
    <div className="w-full flex flex-col justify-start items-start">
      {!userId && <DemoButton />}
      <div className="w-full max-w-xl border border-gray-200 rounded-2xl divide-y divide-gray-200 mb-5 overflow-hidden">
        <NewThread profileImage={mongoProfileImage} />
        <Feed posts={posts} />
      </div>
    </div>
  );
}
