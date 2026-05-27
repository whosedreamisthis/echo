// src/components/back-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton({
  hasAncestors,
}: {
  hasAncestors: boolean;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (hasAncestors) {
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
