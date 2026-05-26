// proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

// Exporting it directly as default matches Next.js 16's standard execution expectations
export default clerkMiddleware();

export const config = {
  matcher: [
    // Ensure static extensions like .jpg are skipped cleanly unless requested dynamically
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
