// app/user/[username]/components/profile-tabs.tsx
"use client";

import { useState } from "react";

type TabType = "threads" | "replies" | "media" | "reposts";

interface ProfileTabsProps {
  username: string;
  // You can pass the actual pre-fetched feed components down as props
  threadsFeed: React.ReactNode;
  repliesFeed: React.ReactNode;
  repostsFeed: React.ReactNode;
}

export default function ProfileTabs({
  username,
  threadsFeed,
  repliesFeed,
  repostsFeed,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("threads");

  const tabs: { id: TabType; label: string }[] = [
    { id: "threads", label: "Threads" },
    { id: "replies", label: "Replies" },
    { id: "media", label: "Media" },
    { id: "reposts", label: "Reposts" },
  ];

  return (
    <div className="w-full mt-4">
      {/* Tab Navigation Headers */}
      <div className="flex border-b border-gray-200 w-full justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 text-center pb-3 text-sm font-medium transition-colors duration-200 relative ${
              activeTab === tab.id
                ? "text-black font-semibold"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {/* Active Bottom Indicator Line */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels Content */}
      <div className="w-full mt-4">
        {activeTab === "threads" && (
          <div className="animate-fadeIn">{threadsFeed}</div>
        )}

        {activeTab === "replies" && (
          <div className="animate-fadeIn">{repliesFeed}</div>
        )}

        {activeTab === "media" && (
          <div className="text-gray-500 text-center py-10 text-sm">
            Visual media items posted by @{username} will show up here.
          </div>
        )}

        {activeTab === "reposts" && (
          <div className="animate-fadeIn">{repostsFeed}</div>
        )}
      </div>
    </div>
  );
}
