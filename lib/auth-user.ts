// lib/auth-user.ts
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import mongoose from "mongoose";

interface SessionUser {
  userId: string | null;
  mongoUserId: string;
  mongoProfileImage: string;
  mongoUsername: string;
}

export async function getSessionUser(): Promise<SessionUser> {
  const { userId } = await auth();

  const defaultImage =
    "https://api.dicebear.com/7.x/avataaars/svg?seed=default";

  // Safe defaults if no user is authenticated
  const result: SessionUser = {
    userId,
    mongoUserId: "",
    mongoProfileImage: defaultImage,
    mongoUsername: "",
  };

  if (!userId) {
    return result;
  }

  try {
    await connectDB();
    // Ensure Schema is registered
    const EnsureUserSchema = User || mongoose.model("User");

    // Fetch both the ID and user picture in ONE single query
    const dbUser = await User.findOne({ clerkId: userId }).select(
      "_id profilePicture username",
    );

    if (dbUser) {
      result.mongoUserId = dbUser._id.toString();

      if (dbUser.profilePicture && dbUser.profilePicture !== "null") {
        result.mongoProfileImage = dbUser.profilePicture;
      }
      result.mongoUsername = dbUser.username;
    }
  } catch (error) {
    console.error("Error fetching session user from MongoDB:", error);
  }

  return result;
}
