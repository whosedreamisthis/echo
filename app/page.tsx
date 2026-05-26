// app/page.tsx

import DemoButton from "@/components/demo-button";
import { auth } from "@clerk/nextjs/server";
import { getPosts } from "@/lib/actions/posts";
import PostCard from "../components/post/post-card";
import Feed from "@/components/feed";
import NewThread from "@/components/new-thread";
import AuthProvider from "@/components/auth-provider";
import { getSessionUser } from "@/lib/auth-user";

export default async function Home() {
  const { userId, mongoUserId, mongoProfileImage } = await getSessionUser();
  const { posts } = await getPosts(userId);

  return (
    <div className="w-full flex flex-col justify-start items-start">
      {!userId && <DemoButton />}
      <div className="w-full max-w-xl border border-gray-200 rounded-2xl divide-y divide-gray-200 mb-5 overflow-hidden">
        <NewThread profileImage={mongoProfileImage} />
        <AuthProvider userId={mongoUserId}>
          <Feed posts={posts} />
        </AuthProvider>
      </div>
    </div>
  );
}
