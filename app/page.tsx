// app/page.tsx

import DemoButton from "@/components/demo-button";
import { auth } from "@clerk/nextjs/server";
import { getPosts } from "@/lib/actions/posts";
import PostCard from "@/components/post-card";

export default async function Home() {
  const { userId } = await auth();
  const { posts } = await getPosts();

  return (
    <div className="w-full flex flex-col justify-start items-start">
      {!userId && <DemoButton />}
      <div className="w-full max-w-xl border border-gray-200 rounded-2xl divide-y divide-gray-200 mb-5 overflow-hidden">
        {" "}
        {posts.map((post) => (
          <div key={post._id} className="border p-5">
            <PostCard post={post} />
          </div>
          // <div key={post.id}>
          //   <h2>{post.title}</h2>
          //   <p>{post.content}</p>
          // </div>
        ))}
      </div>
    </div>
  );
}
