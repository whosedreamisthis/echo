import React from "react";
import { getSessionUser } from "@/lib/auth-user";
import Image from "next/image";
import ProfileTabs from "@/components/profile/profile-tabs";
import Feed from "@/components/feed";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { notFound } from "next/navigation";
// 🍉 Import the newly consolidated Server Action
import { getUserProfileFeed } from "../../actions/profile-feeds";

const UserPage = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  // 🧼 Clean up the username to strip stray router string symbols
  const rawUsername = (await params).username;
  const username = decodeURIComponent(rawUsername).replace("@", "");

  // Fetch the active visitor's authenticated session details
  const { userId: currentClerkUserId } = await getSessionUser();

  await connectDB();
  // 👥 Look up the user details for the profile page being visited
  const targetUser = await User.findOne({ username });

  // If the username typed into the URL bar doesn't exist, throw a 404 page
  if (!targetUser) {
    notFound();
  }

  // 🎯 Fetch separate datasets using the single consolidated action
  const { posts: initialThreads, nextCursor: threadsCursor } =
    await getUserProfileFeed(targetUser._id.toString(), null, "posts");

  const { posts: initialReposts, nextCursor: repostsCursor } =
    await getUserProfileFeed(targetUser._id.toString(), null, "reposts");

  const { posts: initialReplies, nextCursor: repliesCursor } =
    await getUserProfileFeed(targetUser._id.toString(), null, "replies");

  return (
    <div className="overflow-hidden w-full max-w-xl mx-auto flex flex-col min-h-screen bg-white pb-10 mb-5 border rounded-2xl p-5 ">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          {/* Display target user profile data */}
          <h1 className="text-xl font-bold">{targetUser.name}</h1>
          <p className="text-sm text-gray-500">@{targetUser.username}</p>
        </div>
        <Image
          src={
            targetUser.profilePicture ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
          }
          alt={`${targetUser.name}'s Profile Picture`}
          width={72} // Adjusted layout container matching typical Threads spacing
          height={72}
          className="rounded-full bg-zinc-100 object-cover w-18 h-18"
        />
      </div>
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

      <ProfileTabs
        username={targetUser.username}
        threadsFeed={
          <Feed
            initialPosts={initialThreads}
            initialCursor={threadsCursor}
            currentClerkUserId={currentClerkUserId}
            profileUserId={targetUser._id.toString()}
            feedType="threads" // 👈 Fixed pointer state configuration
          />
        }
        repliesFeed={
          <Feed
            initialPosts={initialReplies}
            initialCursor={repliesCursor}
            currentClerkUserId={currentClerkUserId}
            profileUserId={targetUser._id.toString()}
            feedType="replies" // 👈 Fixed replies pointer
          />
        }
        repostsFeed={
          <Feed
            initialPosts={initialReposts}
            initialCursor={repostsCursor}
            currentClerkUserId={currentClerkUserId}
            profileUserId={targetUser._id.toString()}
            feedType="reposts" // 👈 Fixed reposts mapping matrix
          />
        }
      />
    </div>
  );
};

export default UserPage;
