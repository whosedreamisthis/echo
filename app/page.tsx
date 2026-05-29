// app/page.tsx

import DemoButton from "@/components/nav/demo-button";
import { getPosts } from "./actions/echos";
import NewThread from "@/components/new-thread";
import { getSessionUser } from "@/lib/auth-user";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import HomeFeedContainer from "@/components/feed/home-feed-container";
import { cookies } from "next/headers"; // 👈 Import cookies tool

interface HomeProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { userId, mongoUserId, mongoProfileImage } = await getSessionUser();

  // 1. Resolve query params
  const resolvedParams = await searchParams;

  // 2. Read the saved cookie fallback if no param is present in the URL
  const cookieStore = await cookies();
  const savedTabCookie = cookieStore.get("home_feed_tab")?.value;

  // 3. Determine tab: URL parameter takes highest priority, then cookie, then default "following"
  let activeTab: "global" | "following" = "following";
  if (resolvedParams.tab === "global" || resolvedParams.tab === "following") {
    activeTab = resolvedParams.tab;
  } else if (savedTabCookie === "global" || savedTabCookie === "following") {
    activeTab = savedTabCookie;
  }

  // Server-side fetch cleanly matches the state preference
  const { posts, nextCursor } = await getPosts(userId, null, activeTab);

  return (
    <div>
      <div className="flex items-center justify-end mb-5">
        {!userId && <DemoButton />}
        {userId && (
          <SignOutButton>
            <Button>Sign Out</Button>
          </SignOutButton>
        )}
      </div>

      <div className="w-full max-w-xl mx-auto border border-gray-200 bg-white rounded-2xl mb-4">
        <NewThread profileImage={mongoProfileImage} />
      </div>

      <HomeFeedContainer
        initialPosts={posts}
        initialCursor={nextCursor}
        currentClerkUserId={userId}
        mongoUserId={mongoUserId}
        initialTab={activeTab} // 👈 Hydrate with the determined active tab
      />
    </div>
  );
}
