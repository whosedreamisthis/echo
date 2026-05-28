// app/page.tsx

import DemoButton from "@/components/demo-button";
import { getPosts } from "./actions/threads";
import Feed from "@/components/feed";
import NewThread from "@/components/new-thread";
import AuthProvider from "@/components/auth-provider";
import { getSessionUser } from "@/lib/auth-user";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
export default async function Home() {
  const { userId, mongoUserId, mongoProfileImage } = await getSessionUser();

  // Destructure initial items along with the next pointer boundary
  const { posts, nextCursor } = await getPosts(userId);

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
      <div className="w-full flex flex-col justify-center items-center">
        <div className="w-full max-w-xl sm:rounded-2xl mb-5 overflow-hidden border border-gray-200 bg-white">
          <div className="border-b border-gray-200">
            <NewThread profileImage={mongoProfileImage} />
          </div>
          <AuthProvider userId={mongoUserId}>
            {/* Pass data properties down to initiate streaming state machine loop */}
            <Feed
              initialPosts={posts}
              initialCursor={nextCursor}
              currentClerkUserId={userId}
              profileUserId={userId}
              feedType="home"
            />
          </AuthProvider>
        </div>
      </div>
    </div>
  );
}
