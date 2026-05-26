"use client";
import React, {
  useOptimistic,
  useState,
  useTransition,
  useEffect,
} from "react";
import { Heart, MessageCircle, SendHorizontal, RefreshCcw } from "lucide-react";
import { PostType } from "@/lib/types";
import { toggleLike } from "@/lib/actions/posts";
import { useAuthStore } from "@/hooks/useAuthStore";

const PostCardActions = ({ post }: { post: PostType }) => {
  const [isPending, startTransition] = useTransition();
  const currentMongoUserId = useAuthStore((state) => state.currentMongoUserId);

  const userHasLiked = currentMongoUserId
    ? post.likes.includes(currentMongoUserId)
    : false;

  const likeBaseline = {
    hasLiked: userHasLiked,
    count: post.likes.length,
  };

  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    likeBaseline,
    (state, nextHasLikedValue: boolean) => {
      const difference = nextHasLikedValue ? 1 : -1;

      return {
        hasLiked: nextHasLikedValue,
        count: state.count + difference,
      };
    }, // Simply returns the override value
  );
  const numComments = post.comments.length;
  const numShares = post.shares.length;
  const numReposts = post.reposts.length;

  const handleToggleLike = async () => {
    if (!currentMongoUserId) return;

    // 4. Fire the optimistic update instantly
    const nextHasLikedValue = !optimisticLikes.hasLiked;

    startTransition(async () => {
      setOptimisticLikes(nextHasLikedValue);

      const result = await toggleLike(post._id);

      if (!result.success) {
        console.error(result.error);
      }
    });
  };

  return (
    <div className="flex gap-3 items-center">
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <Heart
          className={
            optimisticLikes.hasLiked ? "fill-red-500 text-red-500" : ""
          }
          size={16}
          onClick={handleToggleLike}
        />
        <p className="pt-px">{optimisticLikes.count}</p>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <MessageCircle size={16} />
        <p className="pt-px">{numComments}</p>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <RefreshCcw size={16} />
        <p className="pt-px">{numReposts}</p>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <SendHorizontal size={16} />
        <p className="pt-px">{numShares}</p>
      </div>
    </div>
  );
};

export default PostCardActions;
