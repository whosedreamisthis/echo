"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CreateEchoModal } from "@/components/create-echo-modal";

const NewThread = ({ profileImage }: { profileImage: string }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <div
        className="p-5 flex items-center justify-between"
        onClick={() => setIsCreateOpen(true)}
      >
        <div className="flex items-center gap-3">
          <Image
            src={profileImage}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full bg-zinc-800 w-10 h-10"
          />
          <p className="text-sm text-muted-foreground">What's new?</p>
        </div>

        <Button variant="outline">Post</Button>
      </div>
      <CreateEchoModal
        isOpen={isCreateOpen}
        profileImage={profileImage}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
};

export default NewThread;
