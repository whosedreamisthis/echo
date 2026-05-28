import React from "react";
import { getSavedPosts } from "@/lib/actions/posts";
import PostCard from "@/components/post/post-card";
import { Bookmark } from "lucide-react";

interface SavedPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function SavedPostsPage({ searchParams }: SavedPageProps) {
  // 1. Safely extract the page parameter for pagination support
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);

  // 2. Fetch data directly inside our server environment
  const { posts, error } = await getSavedPosts(currentPage);

  if (error) {
    return (
      <div className="w-full max-w-xl mx-auto mt-10 text-center p-6 border rounded-xl bg-red-50 text-red-600">
        <p className="font-semibold">Failed to load saved posts</p>
        <p className="text-xs mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden  w-full max-w-xl mx-auto flex flex-col min-h-screen bg-white pb-10 mb-5 border rounded-2xl ">
      {/* Page Header Area */}
      <div className="w-full sticky top-0 bg-white/95 backdrop-blur-md pt-6 pb-4 px-5 border-b border-gray-100 z-30 flex items-center gap-2">
        <Bookmark className="h-6 w-6 text-black fill-current" />
        <h1 className="text-xl font-bold tracking-tight">Saved Threads</h1>
      </div>

      {/* Empty State vs Feed Content Layout Render */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 mb-4">
            <Bookmark className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">
            No bookmarked threads
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-xs">
            Threads you save from your main feed will appear here so you can
            read them later.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 pt-5">
          {posts.map((post: any, index) => (
            <div
              key={post._id}
              className={`py-5  ${index === posts?.length - 1 ? "" : "border-b border-gray-200"}`}
            >
              <div className="px-5">
                <PostCard
                  post={post}
                  showThreadLine={false}
                  // ⚡ Hardcode to true because everything inside this view was pulled from the Save collection
                  // initialIsSaved={true}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple Pagination Buttons */}
      {posts.length > 0 && (
        <div className="flex justify-between items-center px-5 mt-6 pt-4 border-t border-gray-100">
          <a
            href={`/saved?page=${currentPage - 1}`}
            className={`text-xs px-3 py-1.5 border rounded-lg transition-colors font-medium ${
              currentPage <= 1
                ? "pointer-events-none text-gray-300 bg-gray-50 border-gray-100"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            Previous
          </a>
          <span className="text-xs text-gray-500 font-medium">
            Page {currentPage}
          </span>
          <a
            href={`/saved?page=${currentPage + 1}`}
            className={`text-xs px-3 py-1.5 border rounded-lg transition-colors font-medium ${
              posts.length < 10
                ? "pointer-events-none text-gray-300 bg-gray-50 border-gray-100"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            Next
          </a>
        </div>
      )}
    </div>
  );
}
