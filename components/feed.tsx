import React from "react";
import { PostType } from "@/lib/types";
import PostCard from "./post/post-card";

const Feed = ({ posts }: { posts: PostType[] }) => {
  return (
    <>
      {posts.map((post, index) => (
        <div
          key={post._id}
          className={`pt-5 pb-2 ${index !== posts.length - 1 ? "border-b" : ""}`}
        >
          <div className="px-5">
            <PostCard post={post} parentPost={null} />
          </div>
        </div>
      ))}
    </>
  );
};

export default Feed;
