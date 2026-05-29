"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { toggleFollow } from "@/app/actions/follow"; // 👈 Path to your action

interface FollowButtonProps {
  targetUserId: string; // 👈 Pass the MongoDB ID of the user to follow
  initialIsFollowing: boolean; // 👈 Pass the initial state calculated by the server
}

const FollowButton = ({
  targetUserId,
  initialIsFollowing,
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  const handleFollowToggle = async () => {
    // ⚡ Optimistic UI update: Toggle instantly for snappy UX
    setIsFollowing((prev) => !prev);

    startTransition(async () => {
      const res = await toggleFollow(targetUserId);

      // Check for explicit falsy success or errors
      if (!res || !res.success || res.isFollowing === undefined) {
        // 🚨 Revert back if the network call fails or returned unexpected payload
        setIsFollowing((prev) => !prev);
        toast.error(res?.error || "Something went wrong");
      } else {
        toast.success(res.isFollowing ? "Followed user" : "Unfollowed user");
        // ⚡ FIX: TypeScript now knows absolutely that res.isFollowing is a boolean here
        setIsFollowing(res.isFollowing);
      }
    });
  };

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={isPending}
      variant={isFollowing ? "outline" : "default"} // Optional variant toggle
      className="w-full sm:w-auto font-semibold rounded-xl"
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};

export default FollowButton;
