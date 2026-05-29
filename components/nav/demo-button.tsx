// app/components/DemoButton.tsx
"use client";

import { useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { createEphemeralDemoUser } from "../../app/actions/demo";

export default function DemoButton() {
  const { isLoaded } = useAuth();
  const clerkEngine = useClerk();

  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    if (!isLoaded || !clerkEngine || loading) return;

    try {
      setLoading(true);

      // 1. Clear any active cookie footprints
      console.log("Flushing active browser sessions...");
      await clerkEngine.signOut();

      // 2. Generate the temporary user via your Server Action
      const actionResult = await createEphemeralDemoUser();

      if (!actionResult.success || !actionResult.token) {
        alert(actionResult.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      const url = new URL(actionResult.token);
      const ticket = url.searchParams.get("__clerk_ticket") || "";

      // 3. Authenticate via the core client sign-in method
      const signInResponse = await clerkEngine.client.signIn.create({
        strategy: "ticket",
        ticket: ticket,
      });

      console.log("Verified Ticket Payload:", signInResponse);

      // 4. Cast the response to any to completely bypass TS2339 property limits
      const rawResponse = signInResponse as any;

      // 5. Check for inline error objects returned by the backend
      if (rawResponse && rawResponse.error) {
        alert(rawResponse.error?.message || "Clerk authentication failed.");
        setLoading(false);
        return;
      }

      // 6. Extract the ID using Clerk's official token keys
      const sessionId =
        rawResponse?.createdSessionId || rawResponse?.session?.id;

      if (sessionId) {
        // Apply the new session token to the browser context
        await clerkEngine.setActive({ session: sessionId });

        // Redirect cleanly to your protected dashboard workspace
        window.location.href = "/";
      } else {
        console.error(
          "Sign-in failed to produce a session ID:",
          signInResponse,
        );
        alert(
          "Handshake completed, but no session ID was found. Check your browser console.",
        );
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Unexpected error during execution:", err);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDemoLogin}
      disabled={loading || !isLoaded}
      className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all"
    >
      {loading ? "Resetting and Logging In..." : "✨ Try Live Demo"}
    </button>
  );
}
