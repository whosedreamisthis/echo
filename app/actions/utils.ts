import { PostType } from "@/lib/types";

export function getPlainPosts(posts: PostType[]) {
  return posts.map((post: any) => {
    return {
      ...post,
      _id: post._id.toString(),
      parentId: post.parentId ? post.parentId.toString() : null,
      userId:
        post.userId && typeof post.userId === "object"
          ? {
              _id: post.userId._id.toString(),
              username: post.userId.username,
              profilePicture: post.userId.profilePicture || null,
            }
          : post.userId,
      likes: post.likes?.map((id: any) => id.toString()) || [],
      reposts: post.reposts?.map((id: any) => id.toString()) || [],
      shares: post.shares?.map((id: any) => id.toString()) || [],
      commentCount: post.commentCount || 0,
      createdAt:
        post.createdAt instanceof Date
          ? post.createdAt.toISOString()
          : post.createdAt,
      // ⚡ FIX 1: Pass along our calculated save boolean flag through the plain serializer wrapper
      isSaved: !!post.isSaved,
    };
  });
}
