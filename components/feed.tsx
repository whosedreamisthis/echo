"use client";

import React, { useState, useEffect, useRef } from "react";
import { PostType } from "@/lib/types";
import PostCard from "./post/post-card";
import { getPosts } from "@/lib/actions/posts"; // 🍉 Import your Server Action

interface CursorType {
  createdAt: string;
  id: string;
}

interface FeedProps {
  initialPosts: PostType[];
  initialCursor: CursorType | null;
  currentClerkUserId?: string | null;
}

const Feed = ({
  initialPosts,
  initialCursor,
  currentClerkUserId,
}: FeedProps) => {
  const [posts, setPosts] = useState<PostType[]>(initialPosts);
  const [cursor, setCursor] = useState<CursorType | null>(initialCursor);
  const [isFetching, setIsFetching] = useState(false);

  // Reference for our intersection observer anchor
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If there is no next cursor, don't set up the observer
    if (!cursor) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        // If the bottom element is visible and we aren't already fetching...
        if (entries[0].isIntersecting && !isFetching) {
          setIsFetching(true);

          try {
            // Call the Server Action directly from the client side!
            const response = await getPosts(currentClerkUserId, cursor);

            if (response && response.posts.length > 0) {
              // Append the new posts to our existing array
              setPosts((prevPosts) => [...prevPosts, ...response.posts]);
              // Update the cursor pointer to the next page boundary
              setCursor(response.nextCursor);
            } else {
              setCursor(null); // No more posts left to fetch
            }
          } catch (error) {
            console.error("Failed to load more posts:", error);
          } finally {
            setIsFetching(false);
          }
        }
      },
      { threshold: 1.0 }, // Trigger immediately when the target element is 100% visible
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    // Clean up observer listeners when dependencies change or component unmounts
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [cursor, isFetching, currentClerkUserId]);

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

      {/* 🍉 Infinite Scroll Anchor Target */}
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
