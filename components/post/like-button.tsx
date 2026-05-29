"use client";
import React, { useOptimistic, useTransition } from "react";
import { Heart, MessageCircle, SendHorizontal, RefreshCcw } from "lucide-react";
import { PostType } from "@/lib/types";
import { toggleLike } from "../../app/actions/interactions";

const LikeButton = ({
  post,
  currentMongoUserId,
}: {
  post: PostType;
  currentMongoUserId: string | null;
}) => {
  const [isPending, startTransition] = useTransition();

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
    },
  );

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
    <div className="flex items-center gap-1 text-muted-foreground text-sm ">
      <button
        onClick={handleToggleLike}
        className=" cursor-pointer flex gap-1 items-center"
      >
        <Heart
          className={`  select-none ${
            optimisticLikes.hasLiked ? "fill-red-500 text-red-500" : ""
          }
          `}
          size={16}
        />
        <p className="pt-px select-none w-4 text-left font-mono">
          {optimisticLikes.count}
        </p>
      </button>
    </div>
  );
};

export default LikeButton;
