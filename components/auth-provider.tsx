"use client";

import { useEffect } from "react";
import { useAuthStore } from "../hooks/useAuthStore";

export default function AuthProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const setUserId = useAuthStore((state) => state.setUserId);

  // Set the ID as soon as the client mounts
  useEffect(() => {
    if (userId) setUserId(userId);
  }, [userId, setUserId]);

  return <>{children}</>;
}
