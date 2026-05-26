"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({
  children,
}: {
  children?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <button onClick={() => router.back()} className="pb-5  text-white rounded">
      <ArrowLeft className="text-muted-foreground" />
    </button>
  );
}
