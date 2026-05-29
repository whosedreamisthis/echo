"use client";

import React, { useState, useEffect, useRef } from "react";
import { PostType } from "@/lib/types";
import PostCard from "@/components/post/post-card";
import { getPosts } from "@/app/actions/threads";

import { getUserProfileFeed } from "@/app/actions/profile-feeds";

interface CursorType {
  createdAt: string;
  id: string;
}

interface FeedProps {
  initialPosts: PostType[];
  initialCursor: CursorType | null;
  currentClerkUserId?: string | null;
  // ⚡ FIX: Add "global" and "following" to your union type here
  feedType?:
    | "home"
    | "threads"
    | "replies"
    | "reposts"
    | "global"
    | "following";
  profileUserId?: string | null;
}

const Feed = ({
  initialPosts,
  initialCursor,
  currentClerkUserId,
  feedType = "home",
  profileUserId,
}: FeedProps) => {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);
  const [cursor, setCursor] = useState<CursorType | null>(initialCursor);
  const [isFetching, setIsFetching] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosts(initialPosts);
    setCursor(initialCursor);
  }, [initialPosts, initialCursor, feedType]);

  useEffect(() => {
    if (!cursor) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isFetching) {
          setIsFetching(true);

          try {
            let response;

            switch (feedType) {
              case "threads":
                response = await getUserProfileFeed(
                  profileUserId!,
                  cursor,
                  "posts",
                );
                break;
              case "replies":
                response = await getUserProfileFeed(
                  profileUserId!,
                  cursor,
                  "replies",
                );
                break;
              case "reposts":
                response = await getUserProfileFeed(
                  profileUserId!,
                  cursor,
                  "reposts",
                );
                break;
              // ⚡ FIX: Forward the specific feedType ("global" or "following") to getPosts
              case "global":
              case "following":
                response = await getPosts(currentClerkUserId, cursor, feedType);
                break;
              case "home":
              default:
                response = await getPosts(
                  currentClerkUserId,
                  cursor,
                  "following",
                );
                break;
            }

            if (response && response.posts.length > 0) {
              setPosts((prevPosts) => [...prevPosts, ...response.posts]);
              setCursor(response.nextCursor);
            } else {
              setCursor(null);
            }
          } catch (error) {
            console.error(`Failed to load more items for ${feedType}:`, error);
          } finally {
            setIsFetching(false);
          }
        }
      },
      { threshold: 0.5 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [cursor, isFetching, currentClerkUserId, feedType, profileUserId]);

  const renderEmptyState = () => {
    switch (feedType) {
      case "threads":
        return "This user hasn't posted any threads yet.";
      case "replies":
        return "This user hasn't replied to any threads yet.";
      case "reposts":
        return "This user hasn't reposted anything yet.";
      case "following":
        return "Threads from people you follow will show up here. Try following some users!";
      case "global":
      case "home":
      default:
        return "No threads to show right now.";
    }
  };

  if (posts.length === 0 && !isFetching) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 px-4 text-center">
        <p className="text-gray-400 text-sm max-w-sm font-normal leading-relaxed">
          {renderEmptyState()}
        </p>
      </div>
    );
  }

  return (
    <>
      {posts.map((post, index) => (
        <div
          key={post._id}
          className={`pt-5 pb-2 ${index !== posts.length - 1 ? "border-b" : ""}`}
        >
          <div className="px-5">
            <PostCard post={post} />
          </div>
        </div>
      ))}

      {cursor && (
        <div
          ref={observerTarget}
          className="w-full flex justify-center py-6 text-gray-500 text-sm"
        >
          {isFetching ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
          ) : (
            "Scroll to load more..."
          )}
        </div>
      )}
    </>
  );
};

export default Feed;
