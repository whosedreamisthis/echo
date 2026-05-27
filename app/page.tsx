// app/page.tsx

import DemoButton from "@/components/demo-button";
import { auth } from "@clerk/nextjs/server";
import { getPosts } from "@/lib/actions/posts";
import PostCard from "../components/post/post-card";
import Feed from "@/components/feed";
import NewThread from "@/components/new-thread";
import AuthProvider from "@/components/auth-provider";
import { getSessionUser } from "@/lib/auth-user";
import { SignOutButton } from "@clerk/nextjs";

export default async function Home() {
  const { userId, mongoUserId, mongoProfileImage } = await getSessionUser();
  const { posts } = await getPosts(userId);

  return (
    <div className="w-full flex flex-col justify-center items-center">
      {!userId && <DemoButton />}
      <div className="w-full max-w-xl sm:rounded-2xl  mb-5 overflow-hidden border border-gray-200  bg-white">
        <div className="border-b border-gray-200">
          <NewThread profileImage={mongoProfileImage} />
        </div>
        <AuthProvider userId={mongoUserId}>
          <Feed posts={posts} />
        </AuthProvider>
      </div>
    </div>
  );
}
