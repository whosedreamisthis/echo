// Inside app/api/webhooks/clerk/route.ts -> user.created block
import User from "models/user";
import Post from "models/post";
import mongoose from "mongoose";
import connectDB from "@/lib/db";

const { id: clerkUserId, email_addresses, username, image_url } = evt.data;
const primaryEmail = email_addresses?.[0]?.email_address;

try {
  await connectDB();
  console.log(`🧵 Setting up database and generating heavy activity feed...`);

  // 1. Create the primary registering user in MongoDB
  const newUser = await User.create({
    clerkId: clerkUserId,
    username: username || `user_${Math.floor(Math.random() * 10000)}`,
    email: primaryEmail,
    profilePicture: image_url,
  });

  // 2. Ensure system users exist in MongoDB so we have valid ObjectIds
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

  // Combine new user and system users into a pool for authors, likers, and commenters
  const allUserIds = [newUser._id as mongoose.Types.ObjectId, ...systemUserIds];

  // 3. Pool of data for realistic seeding
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

  // 4. Generate 60 historical posts with nested comments and likes
  const bulkPosts = [];
  const totalPostsToSeed = 60;

  for (let i = 0; i < totalPostsToSeed; i++) {
    // Pick random author from our pool
    const randomAuthorId =
      allUserIds[Math.floor(Math.random() * allUserIds.length)];
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

    // Stagger timestamps backward
    const createdAtDate = new Date(Date.now() - i * 60000);

    // Generate random subset of users who liked this post
    const postLikes = allUserIds.filter(() => Math.random() > 0.5);

    // Generate random comments
    const postComments = [];
    const numComments = Math.floor(Math.random() * 4); // 0 to 3 comments per post

    for (let c = 0; c < numComments; c++) {
      postComments.push({
        userId: allUserIds[Math.floor(Math.random() * allUserIds.length)],
        content:
          commentPhrases[Math.floor(Math.random() * commentPhrases.length)],
        createdAt: new Date(createdAtDate.getTime() + c * 5000), // comments happen slightly after post
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

  // 5. Bulk insert everything cleanly
  await Post.insertMany(bulkPosts);
  console.log(
    `✅ Successfully seeded ${totalPostsToSeed} posts with dynamic interactions.`,
  );

  return new Response("User created and infinite scroll feed seeded", {
    status: 200,
  });
} catch (dbError) {
  console.error("Failed to batch seed data:", dbError);
  return new Response("Database error", { status: 500 });
}
