import React from "react";
import { PostType } from "@/lib/types";
import PostCard from "./post/post-card";

const Feed = ({ posts }: { posts: PostType[] }) => {
  return (
    <>
      {posts.map((post) => (
        <div key={post._id} className="border pt-5 px-5 pb-2">
          <PostCard post={post} parentPost={null} />
        </div>
      ))}
    </>
  );
};

export default Feed;
