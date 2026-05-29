"use client";
import React, { useState } from "react";

const FeedTabs = ({
  onSetTab,
}: {
  onSetTab: (tab: "global" | "following") => void;
}) => {
  const [active, setActive] = useState<"global" | "following">("following");

  const handleTabClick = (tab: "global" | "following") => {
    setActive(tab);
    onSetTab(tab); // 👈 Fire the callback to update the feed engine!
  };

  return (
    <div className="flex justify-center items-center gap-10 text-sm mb-5">
      <p
        className={`${active === "global" ? "font-semibold border-b-2 border-black" : "text-gray-500"} pb-1 cursor-pointer transition-all`}
        onClick={() => handleTabClick("global")}
      >
        For you
      </p>
      <p
        className={`${active === "following" ? "font-semibold border-b-2 border-black" : "text-gray-500"} pb-1 cursor-pointer transition-all`}
        onClick={() => handleTabClick("following")}
      >
        Following
      </p>
    </div>
  );
};

export default FeedTabs;
