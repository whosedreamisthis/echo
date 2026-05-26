"use client";
import React, { useState } from "react";
import { Heart, MessageCircle, SendHorizontal, RefreshCcw } from "lucide-react";
import { PostType } from "@/lib/types";

const PostCardActions = ({ post }: { post: PostType }) => {
  const [hasLiked, setHasLiked] = useState<boolean>(
    post.likes.includes(post.userId._id),
  );
  const numLiked = post.likes.length;
  const numComments = post.comments.length;
  const numShares = post.shares.length;
  const numReposts = post.reposts.length;

  return (
    <div className="flex gap-3 items-center">
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <Heart
          className={hasLiked ? "fill-red-500 text-red-500" : ""}
          size={16}
          onClick={() => setHasLiked((prev) => !prev)}
        />
        <p className="pt-0.25">{numLiked}</p>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <MessageCircle size={16} />
        <p className="pt-0.25">{numComments}</p>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <RefreshCcw size={16} />
        <p className="pt-0.25">{numReposts}</p>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <SendHorizontal size={16} />
        <p className="pt-0.25">{numShares}</p>
      </div>
    </div>
  );
};

export default PostCardActions;
