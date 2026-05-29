// src/components/back-button.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
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
