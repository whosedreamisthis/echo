import React from "react";
import Image from "next/image";
import { getRelativeTime } from "@/lib/utils";

interface PostType {
  _id: string;
  content: string;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
}

const PostCard = ({ post }: { post: PostType }) => {
  return (
    <div className="flex gap-3 items-center ">
      {post.userId.profilePicture && (
        <Image
          src={post.userId.profilePicture}
          alt="profile picture"
          width={32}
          height={32}
          className="rounded-full bg-zinc-800 w-10 h-10"
        />
      )}
      <div className="flex flex-col justify-start">
        <div className="flex gap-2 items-center">
          <h2 className="text-xs font-semibold">{post.userId.username}</h2>
          <p className="text-xs text-muted-foreground">
            {getRelativeTime(post.createdAt)}
          </p>
        </div>
        <p className="text-sm">{post.content}</p>
      </div>
    </div>
  );
};

export default PostCard;
