// app/api/webhooks/clerk/route.ts
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { headers } from "next/headers";
import User from "@/models/User";
import Post from "@/models/Post";
import mongoose from "mongoose";
import connectDB from "@/lib/db";

// 🍉 EXPORT THE EXPLICIT POST ROUTE FUNCTION
export async function POST(req: Request) {
  // 1. Verify the Webhook Signature using Svix (Clerk Best Practice)
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET environment variable.");
    return new NextResponse("Webhook secret configuration error", {
      status: 500,
    });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new NextResponse("Error occurred during verification", {
      status: 400,
    });
  }

  // 2. Intercept and isolate the user.created event payload
  if (evt.type === "user.created") {
    const { id: clerkUserId, email_addresses, username, image_url } = evt.data;
    const primaryEmail = email_addresses?.[0]?.email_address;

    try {
      await connectDB();
      console.log(
        `🧵 Setting up database and generating heavy activity feed...`,
      );

      // Create the primary registering user in MongoDB
      const newUser = await User.create({
        clerkId: clerkUserId,
        username: username || `user_${Math.floor(Math.random() * 10000)}`,
        email: primaryEmail,
        profilePicture: image_url,
      });

      // Ensure system users exist in MongoDB so we have valid ObjectIds
      const systemUserNames = ["alpha_dev", "beta_tester", "gamma_coder"];
      const systemUserIds: mongoose.Types.ObjectId[] = [];

      for (const sysName of systemUserNames) {
        let sysUser = await User.findOne({ username: sysName });
        if (!sysUser) {
          sysUser = await User.create({
            clerkId: `sys_${sysName}`,
            username: sysName,
            email: `${sysName}@example.com`,
            profilePicture: `https://api.dicebear.com/7.x/bottts/svg?seed=${sysName}`,
          });
        }
        systemUserIds.push(sysUser._id as mongoose.Types.ObjectId);
      }

      // Combine new user and system users into a pool for interactions
      const allUserIds = [
        newUser._id as mongoose.Types.ObjectId,
        ...systemUserIds,
      ];

      const phrases = [
        "Just migrated this clone to Next.js 15. The server components feel incredibly snappy.",
        "Is anyone else experiencing weird hydration mismatches with dark mode toggles?",
        "Hot take: Tailwind CSS makes prototyping 10x faster, but refactoring a mess.",
        "Spent 3 hours debugging a missing await in a Mongoose pre-save hook. Classic.",
        "Building an infinite scroll component today. Let's see how MongoDB limits handle it.",
        "Can't sleep, thinking about MongoDB aggregation pipelines and lookup stages.",
        "Clerk makes authentication almost too easy.",
        "TypeScript is great until you spend an hour trying to type a single nested API response.",
      ];

      const commentPhrases = [
        "Completely agree with this!",
        "Have you tried resetting the dev server?",
        "Next.js 15 has been a game changer honestly.",
        "F",
        "Big mood on the typescript error lol",
        "Check your peer dependencies, that usually fixes the dark mode flash.",
      ];

      // Generate 60 historical posts with nested comments and likes
      const bulkPosts = [];
      const totalPostsToSeed = 60;

      for (let i = 0; i < totalPostsToSeed; i++) {
        const randomAuthorId =
          allUserIds[Math.floor(Math.random() * allUserIds.length)];
        const randomPhrase =
          phrases[Math.floor(Math.random() * phrases.length)];
        const createdAtDate = new Date(Date.now() - i * 60000);
        const postLikes = allUserIds.filter(() => Math.random() > 0.5);

        const postComments = [];
        const numComments = Math.floor(Math.random() * 4);

        for (let c = 0; c < numComments; c++) {
          postComments.push({
            userId: allUserIds[Math.floor(Math.random() * allUserIds.length)],
            content:
              commentPhrases[Math.floor(Math.random() * commentPhrases.length)],
            createdAt: new Date(createdAtDate.getTime() + c * 5000),
          });
        }

        bulkPosts.push({
          userId: randomAuthorId,
          content: `[Post #${totalPostsToSeed - i}] ${randomPhrase}`,
          likes: postLikes,
          comments: postComments,
          createdAt: createdAtDate,
        });
      }

      // Bulk insert everything cleanly
      await Post.insertMany(bulkPosts);
      console.log(
        `✅ Successfully seeded ${totalPostsToSeed} posts with dynamic interactions.`,
      );

      return new NextResponse("User created and infinite scroll feed seeded", {
        status: 200,
      });
    } catch (dbError) {
      console.error("Failed to batch seed data:", dbError);
      return new NextResponse("Database error during operation processing", {
        status: 500,
      });
    }
  }

  // Fallback response for other unhandled Clerk event loops (e.g., user.updated)
  return new NextResponse("Webhook processed without tracking actions", {
    status: 200,
  });
}
