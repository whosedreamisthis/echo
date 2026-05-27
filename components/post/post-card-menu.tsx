import React from "react";
import { Ellipsis, Link2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const PostCardMenu = ({ postId }: { postId: string }) => {
  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/posts/${postId}`;

    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy link: ", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="z-100 cursor-pointer select-none border-none outline-none focus:outline-none focus-visible:ring-0">
          <Ellipsis size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-30 mr-5">
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-sm">
            <div
              className="w-full flex items-center justify-between"
              onClick={handleCopyLink}
            >
              <p>Copy Link</p> <Link2 size={16} />
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostCardMenu;
