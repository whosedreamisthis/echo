"use client";
import React from "react";
import Image from "next/image";
import { getRelativeTime } from "@/lib/utils";
import { PostType } from "@/lib/types";
import PostCardActions from "./post-card-actions";
import { DEFAULT_AVATAR } from "@/lib/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostStore } from "@/stores/usePostStore";
import PostCardMenu from "./post-card-menu";

const PostCard = ({
  post,
  parentPost,
}: {
  post: PostType;
  parentPost: PostType | null;
}) => {
  const router = useRouter();
  const pushToAncestors = usePostStore((state) => state.pushToAncestors);
  const ancestors = usePostStore((state) => state.ancestors);
  const setAncestors = usePostStore((state) => state.setAncestors);

  const imageSrc =
    post.userId?.profilePicture && post.userId.profilePicture !== "null"
      ? post.userId.profilePicture
      : DEFAULT_AVATAR;

  const handlePostCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;

    const existingIndex = ancestors.findIndex((a) => a._id === post._id);

    if (existingIndex !== -1) {
      const stepsBack = ancestors.length - existingIndex;
      window.history.go(-stepsBack);
    } else {
      if (parentPost !== null) {
        pushToAncestors(parentPost);
      } else {
      }
      router.push(`/posts/${post._id}`);
    }
  };

  return (
    <div
      className="relative z-10 flex gap-3 items-start cursor-pointer "
      onClick={handlePostCardClick}
    >
      {post.userId.profilePicture && (
        <Image
          src={imageSrc}
          alt="profile picture"
          width={20}
          height={20}
          className="rounded-full bg-zinc-800 w-8 h-8 "
        />
      )}
      <div className="flex flex-col justify-start gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <h2 className="text-xs font-bold">{post.userId.username}</h2>
              <p className="text-xs text-muted-foreground">
                {getRelativeTime(post.createdAt)}
              </p>
            </div>
            <div className="absolute -right-3 -top-5">
              <PostCardMenu postId={post._id} />
            </div>
          </div>
          <p className="text-sm text-foreground">{post.content}</p>
        </div>
        <PostCardActions post={post} profileImage={imageSrc} />
      </div>
    </div>
  );
};

export default PostCard;
