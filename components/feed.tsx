import React from "react";
import { PostType } from "@/lib/types";
import PostCard from "@/components/post-card";

const Feed = ({ posts }: { posts: PostType[] }) => {
  return (
    <>
      {posts.map((post) => (
        <div key={post._id} className="border p-5">
          <PostCard post={post} />
        </div>
        // <div key={post.id}>
        //   <h2>{post.title}</h2>
        //   <p>{post.content}</p>
        // </div>
      ))}
    </>
  );
};

export default Feed;
