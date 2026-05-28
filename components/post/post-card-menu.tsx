"use client";

import React, { useState } from "react";
import { Ellipsis, Link2, Bookmark, BookmarkCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { toggleSavePost } from "@/lib/actions/posts";

interface PostCardMenuProps {
  postId: string;
  initialIsSaved: boolean | undefined; // ⚡ Accept the status from the parent post/feed context
}

const PostCardMenu = ({ postId, initialIsSaved }: PostCardMenuProps) => {
  // Track state locally so the UI updates instantly without waiting for the database round-trip
  const [saved, setSaved] = useState(initialIsSaved);

  const handleCopyLink = (e: Event) => {
    e.preventDefault();
    const postUrl = `${window.location.origin}/posts/${postId}`;

    navigator.clipboard
      .writeText(postUrl)
      .then(() => toast.success("Link copied to clipboard"))
      .catch((err) => console.error("Failed to copy link: ", err));
  };

  const handleToggleSavePost = async (e: Event) => {
    e.preventDefault();

    // 1. Optimistically update the UI state immediately
    const nextSavedState = !saved;
    setSaved(nextSavedState);

    try {
      // 2. Call the server action
      const result = await toggleSavePost(postId);

      // 3. Inform the user based on what action just took place
      if (nextSavedState) {
        toast.success("Saved to bookmarks");
      } else {
        toast.success("Removed from bookmarks");
      }
    } catch (error) {
      // 4. Revert state if the server operation crashes
      setSaved(!nextSavedState);
      console.error("Failed to toggle save post: ", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button className="z-40 cursor-pointer select-none border-none outline-none focus:outline-none focus-visible:ring-0">
          <Ellipsis size={20} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-36 mr-5"
        onClick={(e) => e.stopPropagation()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={handleCopyLink}
            className="text-sm cursor-pointer"
          >
            <div className="w-full flex items-center justify-between">
              <p>Copy Link</p> <Link2 size={16} />
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={handleToggleSavePost}
            className="text-sm cursor-pointer"
          >
            <div className="w-full flex items-center justify-between">
              {/* ⚡ Dynamic Text and Icon swaps based on current state */}
              <p>{saved ? "Unsave" : "Save"}</p>
              {saved ? (
                <BookmarkCheck size={16} className="text-black fill-current" />
              ) : (
                <Bookmark size={16} />
              )}
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostCardMenu;
