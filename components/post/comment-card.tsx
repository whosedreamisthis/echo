import React from "react";
import { getRelativeTime } from "@/lib/utils";
import Image from "next/image";
import { DEFAULT_AVATAR } from "@/lib/constants";
import { CommentType } from "@/lib/types";

const CommentCard = ({ comment }: { comment: CommentType }) => {
  const { user, content, createdAt } = comment;
  const imageSrc =
    user?.profilePicture && user.profilePicture !== "null"
      ? user.profilePicture
      : DEFAULT_AVATAR;

  return (
    <div className="flex gap-2 items-start border-b py-5">
      <Image
        src={imageSrc}
        alt="profile picture"
        width={20}
        height={20}
        className="rounded-full bg-zinc-800 w-8 h-8 "
      />
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 items-center">
          <h2 className="text-xs font-bold">{user?.username}</h2>
          <p className="text-xs text-muted-foreground">
            {getRelativeTime(createdAt)}
          </p>
        </div>
        <p className="text-sm text-foreground">{content}</p>
      </div>
    </div>
  );
};

export default CommentCard;
