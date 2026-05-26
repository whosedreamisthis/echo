import React from "react";
import Image from "next/image";
import { getRelativeTime } from "@/lib/utils";
import { PostType } from "@/lib/types";
import PostCardActions from "@/components/post-card-actions";

const DEFAULT_AVATAR =
  "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder";

const PostCard = ({ post }: { post: PostType }) => {
  const imageSrc =
    post.userId?.profilePicture && post.userId.profilePicture !== "null"
      ? post.userId.profilePicture
      : DEFAULT_AVATAR;
  return (
    <div className="flex gap-3 items-start ">
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
          <div className="flex gap-2 items-center">
            <h2 className="text-xs font-bold">{post.userId.username}</h2>
            <p className="text-xs text-muted-foreground">
              {getRelativeTime(post.createdAt)}
            </p>
          </div>
          <p className="text-sm text-foreground">{post.content}</p>
        </div>
        <PostCardActions post={post} />
      </div>
    </div>
  );
};

export default PostCard;
