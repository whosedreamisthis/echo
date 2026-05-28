// components/reply-modal.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // ⚡ Imported to fix the stacking context bug
import { X, Paperclip, BarChart2, Smile } from "lucide-react";
import { createEcho } from "../app/actions/threads";
import Image from "next/image";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import EmojiPicker, { Theme } from "emoji-picker-react";

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileImage: string;
  postId: string;
}

export function ReplyModal({
  isOpen,
  onClose,
  postId,
  profileImage,
}: ReplyModalProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mounted, setMounted] = useState(false); // ⚡ Track client-side mounting
  const pickerRef = useRef<HTMLDivElement>(null);

  const maxChars = 280;
  const charsLeft = maxChars - content.length;
  const isOverLimit = charsLeft < 0;
  const canPost = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  // Track hydration mounting to prevent SSR mismatch errors with Portals
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Do not render anything if the modal is closed or not fully loaded on the client side yet
  if (!isOpen || !mounted) return null;

  const handleClose = () => {
    setContent("");
    setShowEmojiPicker(false);
    onClose();
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    setContent((prevContent) => prevContent + emojiData.emoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPost) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createEcho(content, postId);
      if (result.success) {
        handleClose();
        toast.success("Echo posted successfully!");
      } else {
        setError(result.error || "Something went wrong.");
        toast.error(`Error: ${result.error}`);
      }
    } catch (err) {
      setError("Failed to post Echo. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ⚡ Teleport layout elements cleanly to document.body, escaping parent z-index boxes entirely
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 🌑 BACKDROP OVERLAY */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* 🧊 MODAL BOX */}
      <div className="relative w-full max-w-xl rounded-2xl border bg-white p-6 shadow-2xl transition-all animate-in zoom-in-95 duration-200 z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            Reply to Echo
          </h2>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Text Area Frame */}
          <div className="flex gap-3 items-start justify-start flex-col">
            <div className="flex items-center gap-3 w-full">
              <Image
                src={profileImage}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full bg-zinc-800 w-10 h-10 shrink-0 object-cover"
              />

              <TextareaAutosize
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your reply..."
                minRows={1}
                maxRows={8}
                className="w-full resize-none bg-transparent text-lg text-gray-900 focus:outline-none placeholder:text-gray-400 py-1"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="flex-1 w-full">
              <div
                className="relative flex items-center gap-4 text-gray-400 pl-1 mt-1"
                ref={pickerRef}
              >
                <button
                  type="button"
                  className="hover:text-gray-600 transition-colors"
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="hover:text-gray-600 transition-colors"
                >
                  <BarChart2 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="hover:text-gray-600 transition-colors"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="h-5 w-5" />
                </button>

                {showEmojiPicker && (
                  <div className="absolute top-8 left-0 z-50 shadow-xl rounded-xl overflow-hidden border bg-white">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme={Theme.LIGHT}
                      skinTonesDisabled
                      searchDisabled
                      height={350}
                      width={300}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-2 bg-white">
            <span
              className={`text-sm select-none font-medium ${
                isOverLimit
                  ? "text-red-500 font-bold"
                  : charsLeft <= 20
                    ? "text-amber-500"
                    : "text-gray-400"
              }`}
            >
              {charsLeft} characters remaining
            </span>

            <button
              type="submit"
              disabled={!canPost}
              className="px-6 py-2.5 bg-black text-white font-semibold rounded-full shadow hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none transition-all duration-150"
            >
              {isSubmitting ? "Posting..." : "Post Reply"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body, // Teleports DOM element completely outside of PostCard constraints
  );
}
