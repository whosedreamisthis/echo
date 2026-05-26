import React from "react";
import Image from "next/image";
import { getRelativeTime } from "@/lib/utils";
import { PostType } from "@/lib/types";
import PostCardActions from "@/components/post-card-actions";

const PostCard = ({ post }: { post: PostType }) => {
  return (
    <div className="flex gap-3 items-start ">
      {post.userId.profilePicture && (
        <Image
          src={post.userId.profilePicture}
          alt="profile picture"
          width={20}
          height={20}
          className="rounded-full bg-zinc-800 w-8 h-8 "
        />
      )}
      <div className="flex flex-col justify-start gap-3`">
        <div className="flex flex-col gap-1">
          <div className="flex gap-2 items-center">
            <h2 className="text-xs font-bold">{post.userId.username}</h2>
            <p className="text-xs text-muted-foreground">
              {getRelativeTime(post.createdAt)}
            </p>
          </div>
          <p className="text-sm text-foreground">{post.content}</p>
        </div>
        <PostCardActions />
      </div>
    </div>
  );
};

export default PostCard;
