import React from "react";
import { getSessionUser } from "@/lib/auth-user";
import { getPostById } from "@/app/actions/threads"; // ⚡ Removed getPostsWithParent import
import Image from "next/image";
import { DEFAULT_AVATAR } from "@/lib/constants";
import { getRelativeTime } from "@/lib/utils";
import PostCardActions from "@/components/post/post-card-actions";
import PostCard from "@/components/post/post-card";
import { PostType } from "@/lib/types";
import BackButton from "../../../components/nav/back-button";
import AncestorTrail from "@/components/post/ancestor-trail";

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

  // ⚡ 1. Fetch the post, ancestors, and comments all together via getPostById
  const { post, ancestors } = (await getPostById(postId)) as {
    post: (PostType & { comments: PostType[] }) | null;
    ancestors: PostType[];
  };

  // ⚡ 2. REMOVED the redundant getPostsWithParent call that was breaking your states!

  if (!post) {
    return <div>Post not found</div>;
  }

  // ⚡ 3. Safely fall back to an empty array if the post lacks comments
  const comments = post.comments || [];

  return (
    <div>
      <BackButton />
      <div className="w-full flex flex-col justify-start items-start">
        <div className="bg-white w-full max-w-xl border border-gray-200 sm:rounded-2xl mb-5 overflow-hidden py-5">
          <AncestorTrail ancestors={ancestors} />

          <div
            key={post._id}
            className={`${comments.length === 0 ? "" : "border-b"} pb-5 `}
          >
            <div className="px-5">
              <PostCard post={post} />
            </div>
          </div>

          {comments.length > 0 && (
            <div className="px-5 pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground tracking-tight">
                Comments
              </h3>
            </div>
          )}

          <div className="flex flex-col gap-5 pt-5 ">
            {comments?.map((comment: PostType, index) => {
              return (
                <div
                  key={comment._id}
                  className={`${index === comments.length - 1 ? "" : "pb-4 border-b "}`}
                >
                  <div className="px-5">
                    {/* ⚡ 4. This will now correctly carry the checked isSaved state fields! */}
                    <PostCard post={comment} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
