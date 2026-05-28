"use client";

import React, { useState, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";
import SearchFeed from "@/components/search-feed";

interface SearchClientProps {
  currentClerkUserId?: string | null;
}

const SearchClient = ({ currentClerkUserId }: SearchClientProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      <div className="w-full sticky top-0 bg-white/80 pt-5 pb-3 px-5 z-50 border-b border-gray-100">
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
            placeholder="Search all posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. FIXED FEED CONTAINER: Added 'relative z-0' so the browser explicitly
           knows this layer sits completely underneath the z-50 header.
      */}
      <div className="w-full sm:rounded-2xl mt-4 mb-5 overflow-hidden border border-gray-200 bg-white min-h-[50vh] relative z-0">
        <SearchFeed
          query={debouncedTerm}
          currentClerkUserId={currentClerkUserId}
        />
      </div>
    </div>
  );
};

export default SearchClient;
