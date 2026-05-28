"use client";

import React, { useState, useEffect, useRef } from "react";
import { PostType } from "@/lib/types";
import PostCard from "./post/post-card";
import { searchPosts } from "../app/actions/threads";

interface CursorType {
  createdAt: string;
  id: string;
}

interface SearchFeedProps {
  query: string;
  currentClerkUserId?: string | null;
}

const SearchFeed = ({ query, currentClerkUserId }: SearchFeedProps) => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [cursor, setCursor] = useState<CursorType | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Reset and search when query changes
  useEffect(() => {
    const fetchInitialResults = async () => {
      if (!query) {
        setPosts([]);
        setCursor(null);
        return;
      }

      setInitialLoading(true);
      try {
        const response = await searchPosts(query, currentClerkUserId);
        setPosts(response.posts);
        setCursor(response.nextCursor);
      } catch (error) {
        console.error("Failed to search posts:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialResults();
  }, [query, currentClerkUserId]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!cursor || !query) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && !isFetching) {
          setIsFetching(true);
          try {
            const response = await searchPosts(
              query,
              currentClerkUserId,
              cursor,
            );
            if (response && response.posts.length > 0) {
              setPosts((prevPosts) => [...prevPosts, ...response.posts]);
              setCursor(response.nextCursor);
            } else {
              setCursor(null);
            }
          } catch (error) {
            console.error("Failed to load more search results:", error);
          } finally {
            setIsFetching(false);
          }
        }
      },
      { threshold: 1.0 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [cursor, isFetching, query, currentClerkUserId]);

  if (initialLoading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (query && posts.length === 0 && !initialLoading) {
    return (
      <div className="w-full text-center py-10 text-gray-500">
        No results found for "{query}"
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

export default SearchFeed;
