"use client";

import React, { useState, useEffect, useRef } from "react";
import { PostType } from "@/lib/types";
import PostCard from "./post/post-card";
import { getPosts } from "../app/actions/threads"; // 🍉 Import target actions

import { getUserProfileFeed } from "../app/actions/profile-feeds";

interface CursorType {
  createdAt: string;
  id: string;
}

interface FeedProps {
  initialPosts: PostType[];
  initialCursor: CursorType | null;
  currentClerkUserId?: string | null;
  // 👇 New Context Fields
  feedType?: "home" | "threads" | "replies" | "reposts";
  profileUserId?: string | null; // The ID of the person whose profile we are looking at
}

const Feed = ({
  initialPosts,
  initialCursor,
  currentClerkUserId,
  feedType = "home", // Defaults to main home feed
  profileUserId,
}: FeedProps) => {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);
  const [cursor, setCursor] = useState<CursorType | null>(initialCursor);
  const [isFetching, setIsFetching] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // 🔄 1. Reset feed when user toggles tabs (Crucial for Profile page state updates)
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

            // 🎯 2. Dynamically execute the correct database query based on the active feed type
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
              case "home":
              default:
                response = await getPosts(currentClerkUserId, cursor);
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
      { threshold: 0.5 }, // 💡 UI Pro-tip: 0.5 threshold triggers slightly earlier for a smoother scroll experience
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [cursor, isFetching, currentClerkUserId, feedType, profileUserId]);

  return (
    <>
      {posts.map((post, index) => (
        <div
          key={post._id}
          className={`pt-5 pb-2 ${index !== posts.length - 1 ? "border-b" : ""}`}
        >
          <div className="px-5">
            {/* If it's a repost view, you can optionally pass an indicator prop here */}
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
