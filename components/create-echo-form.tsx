// components/CreateEchoForm.tsx
"use client";
import React, { useState } from "react";
import { createEcho } from "@/lib/actions/posts";

export function CreateEchoForm() {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLoading(true);

    // Hardcoding a test username for now until you add Auth
    const result = await createEcho(content);
    setLoading(false);
    if (result.success) {
      setContent("");
      alert("Echo posted successfully!");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded-xl max-w-md mx-auto my-4"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening on Echo?"
        maxLength={280}
        className="w-full p-2 border rounded-md"
        rows={3}
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="mt-2 px-4 py-2 bg-black text-white rounded-full font-bold disabled:bg-gray-400"
      >
        {loading ? "Posting..." : "Echo"}
      </button>
    </form>
  );
}
