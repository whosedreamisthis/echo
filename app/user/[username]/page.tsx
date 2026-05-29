import React from "react";
import { getSessionUser } from "@/lib/auth-user";
import Image from "next/image";
import ProfileTabs from "@/components/profile/profile-tabs";
import Feed from "../../../components/feed/feed";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Follow from "@/models/Follow"; // 👈 1. Import your Follow model
import { notFound } from "next/navigation";
import { getUserProfileFeed } from "../../actions/profile-feeds";
import FollowButton from "@/components/follow-button";

const UserPage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const rawUsername = (await params).username;
  const username = decodeURIComponent(rawUsername).replace("@", "");

  const { userId: currentClerkUserId } = await getSessionUser();

  await connectDB();
  const targetUser = await User.findOne({ username });

  if (!targetUser) {
    notFound();
  }

  // 👥 2. Look up current visitor's MongoDB user record
  let loggedInMongoUser = null;
  let initialIsFollowing = false;

  if (currentClerkUserId) {
    loggedInMongoUser = await User.findOne({ clerkId: currentClerkUserId });

    if (loggedInMongoUser) {
      // 🕵️‍♂️ 3. Check if a follow record already exists between these two users
      const followRecord = await Follow.findOne({
        followerId: loggedInMongoUser._id, // The visitor
        followingId: targetUser._id, // The profile owner
      });

      initialIsFollowing = !!followRecord; // Converts the document (or null) to a true/false boolean
    }
  }

  // Check if the current logged-in visitor owns this profile page
  const isOwnProfile =
    loggedInMongoUser &&
    loggedInMongoUser._id.toString() === targetUser._id.toString();

  // Fetch separate datasets using the single consolidated action
  const { posts: initialEchos, nextCursor: echosCursor } =
    await getUserProfileFeed(targetUser._id.toString(), null, "posts");

  const { posts: initialReposts, nextCursor: repostsCursor } =
    await getUserProfileFeed(targetUser._id.toString(), null, "reposts");

  const { posts: initialReplies, nextCursor: repliesCursor } =
    await getUserProfileFeed(targetUser._id.toString(), null, "replies");

  return (
    <div className="overflow-hidden w-full max-w-xl mx-auto flex flex-col min-h-screen bg-white pb-10 mb-5 border rounded-2xl p-5 ">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">{targetUser.name}</h1>
          <p className="text-sm text-gray-500">@{targetUser.username}</p>
        </div>
        <Image
          src={
            targetUser.profilePicture ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
          }
          alt={`${targetUser.name}'s Profile Picture`}
          width={72}
          height={72}
          className="rounded-full bg-zinc-100 object-cover w-18 h-18"
        />
      </div>
      <div className="flex items-center justify-between gap-5">
        <div>
          <div className="text-gray-700 text-sm mt-5">{targetUser.bio}</div>
          {targetUser.website && (
            <a
              href={targetUser.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold mt-2 text-blue-600 hover:underline block"
            >
              {targetUser.website}
            </a>
          )}
        </div>

        {/* 🎯 4. Pass down the target user ID and calculated initial state */}
        {/* Only show the follow button if they are logged in AND it's not their own profile */}
        {currentClerkUserId && !isOwnProfile && (
          <FollowButton
            targetUserId={targetUser._id.toString()}
            initialIsFollowing={initialIsFollowing}
          />
        )}
      </div>

      <ProfileTabs
        username={targetUser.username}
        echosFeed={
          <Feed
            initialPosts={initialEchos}
            initialCursor={echosCursor}
            currentClerkUserId={currentClerkUserId}
            profileUserId={targetUser._id.toString()}
            feedType="echos"
          />
        }
        repliesFeed={
          <Feed
            initialPosts={initialReplies}
            initialCursor={repliesCursor}
            currentClerkUserId={currentClerkUserId}
            profileUserId={targetUser._id.toString()}
            feedType="replies"
          />
        }
        repostsFeed={
          <Feed
            initialPosts={initialReposts}
            initialCursor={repostsCursor}
            currentClerkUserId={currentClerkUserId}
            profileUserId={targetUser._id.toString()}
            feedType="reposts"
          />
        }
      />
    </div>
  );
};

export default UserPage;
