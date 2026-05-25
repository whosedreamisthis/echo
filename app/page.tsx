// app/page.tsx
import { CreateEchoForm } from "@/components/create-echo-form";
import DemoButton from "@/components/demo-button";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  return (
    <div className="w-full flex flex-col justify-start items-start">
      <h1 className="text-3xl font-bold mb-6">Echo</h1>
      {!userId && <DemoButton />}
      <CreateEchoForm />
    </div>
  );
}
