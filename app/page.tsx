// app/page.tsx

import DemoButton from "@/components/demo-button";
import { getPosts } from "./actions/threads";
import NewThread from "@/components/new-thread";
import { getSessionUser } from "@/lib/auth-user";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import HomeFeedContainer from "@/components/home-feed-container";

export default async function Home() {
  const { userId, mongoUserId, mongoProfileImage } = await getSessionUser();

  // Fetch default "following" feed server-side for rapid First Contentful Paint
  const { posts, nextCursor } = await getPosts(userId, null, "following");

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

      {/* Client container manages tab switching & infinite stream properties */}
      <HomeFeedContainer
        initialPosts={posts}
        initialCursor={nextCursor}
        currentClerkUserId={userId}
        mongoUserId={mongoUserId}
      />
    </div>
  );
}
