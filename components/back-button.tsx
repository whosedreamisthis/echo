"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePostStore } from "@/stores/usePostStore";

export default function BackButton({
  children,
}: {
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const popFromAncestors = usePostStore((state) => state.popFromAncestors);

  const handleBack = () => {
    popFromAncestors();
    router.back();
  };

  return (
    <button
      onClick={handleBack}
      className="pb-5  text-white rounded cu cursor-pointer"
    >
      <ArrowLeft className="text-muted-foreground" />
    </button>
  );
}
