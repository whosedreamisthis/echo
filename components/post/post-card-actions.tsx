"use client";
import React, { useState } from "react";
import { MessageCircle, SendHorizontal, RefreshCcw } from "lucide-react";
import { PostType } from "@/lib/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import LikeButton from "./like-button";
import RepostButton from "./repost-button";
import { ReplyModal } from "@/components/reply-modal";

const PostCardActions = ({
  post,
  profileImage,
}: {
  post: PostType;
  profileImage: string;
}) => {
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  const currentMongoUserId = useAuthStore((state) => state.currentMongoUserId);

  const numComments = post.commentCount;
  const numShares = post.shares.length;
  const numReposts = post.reposts.length;

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsReplyOpen(true);
  };
  return (
    <>
      <div className="z-50 flex gap-3 items-center">
        <LikeButton post={post} currentMongoUserId={currentMongoUserId} />

        <div
          className="flex items-center gap-1 text-muted-foreground text-sm cursor-pointer z-60"
          onClick={handleReply}
        >
          <MessageCircle size={16} />
          <p className="pt-px">{numComments}</p>
        </div>
        <RepostButton post={post} currentMongoUserId={currentMongoUserId} />
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <SendHorizontal size={16} />
          <p className="pt-px">{numShares}</p>
        </div>
      </div>
      <ReplyModal
        isOpen={isReplyOpen}
        profileImage={profileImage}
        onClose={() => setIsReplyOpen(false)}
        postId={post._id}
      />
    </>
  );
};

export default PostCardActions;
