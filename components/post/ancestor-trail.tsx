// src/components/post/ancestor-trail.tsx
"use client";

import { useEffect } from "react";
import { usePostStore } from "@/stores/usePostStore";
import PostCard from "@/components/post/post-card";
import { useParams } from "next/navigation";

const AncestorTrail = () => {
  const ancestors = usePostStore((state) => state.ancestors);
  const setAncestors = usePostStore((state) => state.setAncestors);
  const params = useParams();
  const currentPostId = params?.postId;

  useEffect(() => {
    if (!currentPostId) return;

    // Check if the page we just loaded is actually one of our tracked ancestors
    const activeIndex = ancestors.findIndex((a) => a._id === currentPostId);

    if (activeIndex !== -1) {
      // 🍉 If the user navigated backwards into history, sync Zustand instantly
      // by keeping everything up to (but not including) this newly active post.
      setAncestors(ancestors.slice(0, activeIndex));
    }
  }, [currentPostId]); // Only fire when the active URL page ID changes

  if (ancestors.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {ancestors.map((ancestor, index) => {
        const calculatedParent = index > 0 ? ancestors[index - 1] : null;
        return (
          <PostCard
            key={ancestor._id}
            post={ancestor}
            parentPost={calculatedParent}
          />
        );
      })}
    </div>
  );
};

export default AncestorTrail;
