// app/page.tsx
import { CreateEchoForm } from "@/components/create-echo-form";

export default function Home() {
  return (
    <div className="w-full flex flex-col justify-start items-start">
      <h1 className="text-3xl font-bold mb-6">Echo</h1>
      <CreateEchoForm />
    </div>
  );
}
