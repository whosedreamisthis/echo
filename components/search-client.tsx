"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search as SearchIcon } from "lucide-react";
import SearchFeed from "./feed/search-feed";
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

  // Track if the component is mounted to prevent execution during page unmounts
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false; // 👈 Set to false instantly when user clicks away
    };
  }, []);

  // Debounce the input state changes safely
  useEffect(() => {
    // If the input matches our current state, do absolutely nothing
    if (searchTerm === debouncedTerm) return;

    const timer = setTimeout(() => {
      // ⚡ Safety Guard: If the user has clicked away and unmounted the component,
      // kill the execution thread immediately so it doesn't hijack the navigation!
      if (!isMounted.current || pathname !== "/search") return;

      setDebouncedTerm(searchTerm);

      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("q", searchTerm);
      } else {
        params.delete("q");
      }

      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(newUrl, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
    // ⚡ Keep dependencies limited strictly to string input mutations
  }, [searchTerm, debouncedTerm, pathname, router, searchParams]);

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
