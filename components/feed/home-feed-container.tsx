"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FeedTabs from "@/components/feed/feed-tabs";
import Feed from "@/components/feed/feed";
import AuthProvider from "@/components/auth-provider";
import { getPosts } from "../../app/actions/echos";

interface HomeFeedContainerProps {
  initialPosts: any[];
  initialCursor: any;
  currentClerkUserId: string | null;
  mongoUserId: string;
  initialTab: "global" | "following";
}

export default function HomeFeedContainer({
  initialPosts,
  initialCursor,
  currentClerkUserId,
  mongoUserId,
  initialTab,
}: HomeFeedContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [feedType, setFeedType] = useState<"global" | "following">(initialTab);
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();

  // Keep internal state aligned if the URL search param changes
  useEffect(() => {
    const currentParam = searchParams.get("tab");
    if (currentParam === "global" || currentParam === "following") {
      if (currentParam !== feedType) {
        setFeedType(currentParam);
      }
    }
  }, [searchParams, feedType]);

  const handleTabChange = async (selectedTab: "global" | "following") => {
    setFeedType(selectedTab);

    // 1. Sync the URL query string instantly
    router.push(`/?tab=${selectedTab}`, { scroll: false });

    // 2. ⚡ Save choice to a cookie so clean links to "/" remember it
    document.cookie = `home_feed_tab=${selectedTab}; path=/; max-age=31536000`;

    startTransition(async () => {
      const res = await getPosts(currentClerkUserId, null, selectedTab);
      setPosts(res.posts);
      setCursor(res.nextCursor);
    });
  };

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <FeedTabs activeTab={feedType} onSetTab={handleTabChange} />

      <div
        className={`w-full max-w-xl sm:rounded-2xl mb-5 overflow-hidden border border-gray-200 bg-white transition-opacity ${
          isPending ? "opacity-50" : "opacity-100"
        }`}
      >
        <AuthProvider userId={mongoUserId}>
          <Feed
            key={feedType}
            initialPosts={posts}
            initialCursor={cursor}
            currentClerkUserId={currentClerkUserId}
            feedType={feedType}
          />
        </AuthProvider>
      </div>
    </div>
  );
}
