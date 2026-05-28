"use client";

import React, { useState, useEffect } from "react";
import { Search as SearchIcon } from "lucide-react";
import SearchFeed from "@/components/search-feed";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface SearchClientProps {
  currentClerkUserId?: string | null;
}

const SearchClient = ({ currentClerkUserId }: SearchClientProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initialQuery = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedTerm, setDebouncedTerm] = useState(initialQuery);

  // Debounce the searchTerm and update the URL and debouncedTerm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);

      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }

      // Update URL without adding to history stack for every keystroke if possible,
      // but standard router.push/replace is fine here since we want back button to work.
      // However, we only want to update URL with the debounced term to avoid history bloat.
      const newUrl = `${pathname}?${params.toString()}`;
      if (params.toString()) {
        router.replace(newUrl);
      } else {
        router.replace(pathname);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      <div className="w-full sticky top-0 bg-white/80 pt-5 pb-3 px-5 z-30 border-b border-gray-100">
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

      <div className="w-full sm:rounded-2xl mt-4 mb-5 overflow-hidden border border-gray-200 bg-white min-h-[50vh] ">
        <SearchFeed
          query={debouncedTerm}
          currentClerkUserId={currentClerkUserId}
        />
      </div>
    </div>
  );
};

export default SearchClient;
