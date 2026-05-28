import React from "react";
import SearchClient from "@/components/search-client";
import { getSessionUser } from "@/lib/auth-user";

const SearchPage = async () => {
  const { userId } = await getSessionUser();
  return <SearchClient currentClerkUserId={userId} />;
};

export default SearchPage;
