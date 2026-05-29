"use client";
import React from "react";

interface FeedTabsProps {
  activeTab: "global" | "following";
  onSetTab: (tab: "global" | "following") => void;
}

const FeedTabs = ({ activeTab, onSetTab }: FeedTabsProps) => {
  return (
    <div className="flex justify-center items-center gap-10 text-sm mb-5">
      <p
        className={`${activeTab === "global" ? "font-semibold border-b-2 border-black" : "text-gray-500"} pb-1 cursor-pointer transition-all`}
        onClick={() => onSetTab("global")}
      >
        For you
      </p>
      <p
        className={`${activeTab === "following" ? "font-semibold border-b-2 border-black" : "text-gray-500"} pb-1 cursor-pointer transition-all`}
        onClick={() => onSetTab("following")}
      >
        Following
      </p>
    </div>
  );
};

export default FeedTabs;
