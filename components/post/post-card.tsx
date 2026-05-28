// src/components/post/post-card.tsx
"use client";
import React from "react";
import Image from "next/image";
import { getRelativeTime } from "@/lib/utils";
import { PostType } from "@/lib/types";
import PostCardActions from "./post-card-actions";
import { DEFAULT_AVATAR } from "@/lib/constants";
import { useRouter } from "next/navigation";
import PostCardMenu from "./post-card-menu";

interface PostCardProps {
  post: PostType;
  showThreadLine?: boolean;
}

const PostCard = ({ post, showThreadLine = false }: PostCardProps) => {
  const router = useRouter();

  const imageSrc =
    post.userId?.profilePicture && post.userId.profilePicture !== "null"
      ? post.userId.profilePicture
      : DEFAULT_AVATAR;

  const handlePostCardClick = (e: React.MouseEvent) => {
    router.push(`/post/${post._id}`);
  };

  return (
    // 🍉 Added 'relative' here so the thread line treats this entire card as its boundary
    <div
      className="relative z-10 flex gap-3 items-start cursor-pointer group"
      onClick={handlePostCardClick}
    >
      {/* 🍉 The Dynamic Thread Line */}
      {showThreadLine && (
        <div
          className="absolute bg-gray-200 z-30"
          style={{
            width: "2px",
            left: "15px", // Exactly centers it under a 32px (w-8) avatar
            top: "43px", // Starts right below the avatar circle
            bottom: "-10px", // Stretches past the bottom to bridge the gap to the next card
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
              <h2 className="text-xs font-bold truncate max-w-[150px]">
                {post.userId?.username || "anonymous"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {getRelativeTime(post.createdAt)}
              </p>
            </div>
            <div className="absolute -right-3 -top-5">
              <PostCardMenu postId={post._id} initialIsSaved={post.isSaved} />
            </div>
          </div>
          <p className="text-sm text-foreground break-words">{post.content}</p>
        </div>
        <PostCardActions post={post} profileImage={imageSrc} />
      </div>
    </div>
  );
};

export default PostCard;
