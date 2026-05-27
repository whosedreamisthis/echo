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
    <div className="pb-4">
      <div className="flex flex-col gap-4 px-5">
        {ancestors.map((ancestor, index) => {
          const calculatedParent = index > 0 ? ancestors[index - 1] : null;
          return (
            <div key={ancestor._id} className={`pb-5 border-b`}>
              <PostCard post={ancestor} parentPost={calculatedParent} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AncestorTrail;
