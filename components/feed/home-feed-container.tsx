"use client";

import React, { useState, useTransition } from "react";
import FeedTabs from "@/components/feed/feed-tabs";
import Feed from "@/components/feed/feed";
import AuthProvider from "@/components/auth-provider";
import { getPosts } from "@/app/actions/threads";

interface HomeFeedContainerProps {
  initialPosts: any[];
  initialCursor: any;
  currentClerkUserId: string | null;
  mongoUserId: string;
}

export default function HomeFeedContainer({
  initialPosts,
  initialCursor,
  currentClerkUserId,
  mongoUserId,
}: HomeFeedContainerProps) {
  const [feedType, setFeedType] = useState<"global" | "following">("following");
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();

  const handleTabChange = async (selectedTab: "global" | "following") => {
    setFeedType(selectedTab);

    // Trigger Server Action refetch within a transition
    startTransition(async () => {
      const res = await getPosts(currentClerkUserId, null, selectedTab);
      setPosts(res.posts);
      setCursor(res.nextCursor);
    });
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      {/* Pass state setter to tabs */}
      <FeedTabs onSetTab={handleTabChange} />

      <div
        className={`w-full max-w-xl sm:rounded-2xl mb-5 overflow-hidden border border-gray-200 bg-white transition-opacity ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        <AuthProvider userId={mongoUserId}>
          {/* Keying the feed forces a clean state re-init on tab changes */}
          <Feed
            key={feedType}
            initialPosts={posts}
            initialCursor={cursor}
            currentClerkUserId={currentClerkUserId}
            profileUserId={currentClerkUserId}
            feedType={feedType}
          />
        </AuthProvider>
      </div>
    </div>
  );
}
