import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRelativeTime(dateInput: Date | string | number): string {
  const now = new Date();
  const postDate = new Date(dateInput);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  // Less than a minute ago
  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d`;
  }

  // Fallback to a clean date format if it's older than a week
  return postDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
