"use client";
import React from "react";
import { usePostStore } from "@/stores/usePostStore";
import PostCard from "@/components/post/post-card";

const AncestorTrail = () => {
  const ancestors = usePostStore((state) => state.ancestors);

  if (ancestors.length === 0) return <div></div>;
  return (
    <div className="">
      {ancestors.map((ancestor, index) => (
        <PostCard
          key={ancestor._id}
          post={ancestor}
          parentPost={index >= 1 ? ancestors[index - 1] : null}
        />
      ))}
    </div>
  );
};

export default AncestorTrail;
