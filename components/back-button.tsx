// src/components/back-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { usePostStore } from "@/stores/usePostStore";

export default function BackButton() {
  const router = useRouter();
  const ancestors = usePostStore((state) => state.ancestors);

  const handleBack = () => {
    if (ancestors.length > 0) {
      // State sync will be handled automatically by AncestorTrail's useEffect!
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <button
      onClick={handleBack}
      className="p-5 text-white rounded cursor-pointer"
    >
      <ArrowLeft className="text-muted-foreground hover:text-white transition-colors" />
    </button>
  );
}
