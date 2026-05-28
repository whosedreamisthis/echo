"use client";
import React from "react";
import Image from "next/image";
import { getRelativeTime } from "@/lib/utils";
import { PostType } from "@/lib/types";
import PostCardActions from "./post-card-actions";
import { DEFAULT_AVATAR } from "@/lib/constants";
import { useRouter } from "next/navigation";
import PostCardMenu from "./post-card-menu";
import { Repeat2 } from "lucide-react"; // 👈 Import a clean repost icon

interface PostCardProps {
  post: PostType;
  showThreadLine?: boolean;
  showRepostHeader?: boolean; // 👈 1. Added to your TypeScript contract interface
}

const PostCard = ({
  post,
  showThreadLine = false,
  showRepostHeader = false, // 👈 Default to false for home feed/threads view
}: PostCardProps) => {
  const router = useRouter();

  const imageSrc =
    post.userId?.profilePicture && post.userId.profilePicture !== "null"
      ? post.userId.profilePicture
      : DEFAULT_AVATAR;

  const handlePostCardClick = (e: React.MouseEvent) => {
    router.push(`/post/${post._id}`);
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/@${post.userId?.username}`); // 👈 Premium clean URL structure
  };

  // Check if we should show the repost header.
  // We show it if showRepostHeader is true OR if the first item in reposts is an object (populated)
  const firstReposter =
    post.reposts &&
    post.reposts.length > 0 &&
    typeof post.reposts[0] === "object"
      ? (post.reposts[0] as { name: string })
      : null;

  return (
    // Wrap the card layout in an outer block container so the repost header stays inline
    <div className="flex flex-col w-full">
      {/* 🔄 2. Dynamic Repost Notification Banner */}
      {(showRepostHeader || firstReposter) && (
        <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold mb-2 pl-8">
          <Repeat2 className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{firstReposter?.name || "Someone"} reposted</span>
        </div>
      )}

      <div
        className="relative z-10 flex gap-3 items-start cursor-pointer group"
        onClick={handlePostCardClick}
      >
        {/* The Dynamic Thread Line */}
        {showThreadLine && (
          <div
            className="absolute bg-gray-200 z-30"
            style={{
              width: "2px",
              left: "15px",
              top: "43px",
              bottom: "-10px",
            }}
          />
        )}

        {/* Avatar Column */}
        <div className="flex flex-col items-center flex-shrink-0 relative">
          {imageSrc && (
            <Image
              src={imageSrc}
              alt="profile picture"
              width={32}
              height={32}
              className="rounded-full bg-zinc-800 w-8 h-8 relative z-20"
            />
          )}
        </div>

        {/* Content Column */}
        <div className="flex flex-col justify-start gap-3 w-full min-w-0">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <div onClick={handleUserClick} className="hover:underline z-20">
                  <h2 className="text-sm font-bold truncate max-w-[150px] ">
                    {post.userId?.username || "anonymous"}
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  {getRelativeTime(post.createdAt)}
                </p>
              </div>
              <div className="absolute -right-3 -top-5">
                <PostCardMenu postId={post._id} initialIsSaved={post.isSaved} />
              </div>
            </div>
            <p className="text-sm text-foreground break-words">
              {post.content}
            </p>
          </div>
          <PostCardActions post={post} profileImage={imageSrc} />
        </div>
      </div>
    </div>
  );
};

export default PostCard;
