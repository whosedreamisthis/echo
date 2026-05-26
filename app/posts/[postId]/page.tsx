import React from "react";
import { getSessionUser } from "@/lib/auth-user";
import { getPostById } from "@/lib/actions/posts";
import Image from "next/image";
import { DEFAULT_AVATAR } from "@/lib/constants";
import { getRelativeTime } from "@/lib/utils";
import PostCardActions from "@/components/post/post-card-actions";
import CommentCard from "@/components/post/comment-card";
import { CommentType } from "@/lib/types";

const PostPage = async ({
  params,
}: {
  params: Promise<{ postId: string }>;
}) => {
  const [resolvedParams, sessionUser] = await Promise.all([
    params,
    getSessionUser(),
  ]);
  const { postId } = resolvedParams;
  const { userId, mongoUserId, mongoProfileImage, mongoUsername } = sessionUser;

  const { post } = await getPostById(postId);

  if (!post) {
    return <div>Post not found</div>;
  }

  const imageSrc =
    mongoProfileImage && mongoProfileImage !== "null"
      ? mongoProfileImage
      : DEFAULT_AVATAR;

  return (
    <div className="w-full flex flex-col justify-start items-start">
      <div className="w-full max-w-xl border border-gray-200 rounded-2xl divide-y divide-gray-200 mb-5 overflow-hidden p-5">
        <div className="flex flex-col justify-start gap-5 pb-5">
          <div className="flex gap-2 items-center">
            <Image
              src={imageSrc}
              alt="profile picture"
              width={20}
              height={20}
              className="rounded-full bg-zinc-800 w-8 h-8 "
            />
            <p className="text-sm font-semibold">{mongoUsername}</p>
            <p className="text-xs text-muted-foreground">
              {getRelativeTime(post.createdAt)}
            </p>
          </div>
          <p className="text-sm">{post.content}</p>
          <PostCardActions post={post} />
        </div>
        <div className="flex flex-col gap-5">
          {post.comments.map((comment: CommentType) => {
            return <CommentCard key={comment._id} comment={comment} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default PostPage;
