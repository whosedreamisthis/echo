import React, { Suspense } from "react";
import SearchClient from "@/components/search-client";
import { getSessionUser } from "@/lib/auth-user";

const SearchPage = async () => {
  const { userId } = await getSessionUser();
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchClient currentClerkUserId={userId} />
    </Suspense>
  );
};

export default SearchPage;
