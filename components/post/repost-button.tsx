"use client";
import React, { useOptimistic, useTransition } from "react";
import { RefreshCcw } from "lucide-react";
import { PostType } from "@/lib/types";
import { toggleRepost } from "@/app/actions/interactions";

const RepostButton = ({
  post,
  currentMongoUserId,
}: {
  post: PostType;
  currentMongoUserId: string | null;
}) => {
  const [isPending, startTransition] = useTransition();

  const userHasReposted = currentMongoUserId
    ? post.reposts.includes(currentMongoUserId)
    : false;

  const repostBaseline = {
    hasReposted: userHasReposted,
    count: post.reposts.length,
  };

  const [optimisticReposts, setOptimisticReposts] = useOptimistic(
    repostBaseline,
    (state, nextHasRepostedValue: boolean) => {
      const difference = nextHasRepostedValue ? 1 : -1;

      return {
        hasReposted: nextHasRepostedValue,
        count: state.count + difference,
      };
    },
  );

  const handleToggleRepost = async () => {
    if (!currentMongoUserId) return;

    // 4. Fire the optimistic update instantly
    const nextHasRepostedValue = !optimisticReposts.hasReposted;

    startTransition(async () => {
      setOptimisticReposts(nextHasRepostedValue);

      const result = await toggleRepost(post._id);

      if (!result.success) {
        console.error(result.error);
      }
    });
  };

  return (
    <div className="flex items-center gap-1 text-muted-foreground text-sm ">
      <button onClick={handleToggleRepost} className="flex gap-1 items-center">
        <RefreshCcw
          className={` cursor-pointer select-none ${
            optimisticReposts.hasReposted ? "font-semibold text-black" : ""
          }
          `}
          size={16}
        />
        <p
          className={`pt-px select-none w-4 text-left font-mono ${
            optimisticReposts.hasReposted ? "font-semibold text-black" : ""
          }`}
        >
          {optimisticReposts.count}
        </p>
      </button>
    </div>
  );
};

export default RepostButton;
