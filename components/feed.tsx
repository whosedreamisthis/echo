import React from "react";
import { PostType } from "@/lib/types";
import PostCard from "./post/post-card";

const Feed = ({ posts }: { posts: PostType[] }) => {
  return (
    <>
      {posts.map((post) => (
        <div key={post._id} className=" border-b border-gray-200 pt-5 pb-2">
          <div className="px-5">
            <PostCard post={post} parentPost={null} />
          </div>
        </div>
      ))}
    </>
  );
};

export default Feed;
