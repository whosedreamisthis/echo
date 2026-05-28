import mongoose from "mongoose";
import connectDB from "../lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Repost from "@/models/Repost"; // 👈 Import your new Repost model

const POST_TEMPLATES = [
  "Just deploying my new Next.js app. The DX is incredible! 🚀",
  "Is it just me, or is database seeding oddly satisfying?",
  "Remember to take breaks, drink water, and stretch your back today, devs! 💧",
  "Switched from relational to MongoDB for this project, and embedding comments was the best decision.",
  "What is your favorite CSS framework in 2026 and why is it still Tailwind?",
  "Coffee is brewed. Code is open. Let's build something awesome today.",
];

const COMMENT_TEMPLATES = [
  "Totally agree with this!",
  "Nice work! Can you share the repo?",
  "This saved me hours of debugging.",
  "Haha, so true.",
  "Interesting take, but have you considered performance edge cases?",
  "Love the energy here! 🙌",
];

// Helper to convert usernames to Readable Names for the new schema field
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

async function seedDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();

    console.log("🧹 Clearing existing Users, Posts, and Reposts...");
    await User.deleteMany({});
    await Post.deleteMany({});
    await Repost.deleteMany({}); // 👈 Clear previous repost entries

    console.log("👥 Creating seed community users with bios and profiles...");
    const usernames = [
      "alice_dev",
      "bob_codes",
      "charlie_js",
      "dana_design",
      "evan_builds",
    ];
    const seedUsers: any[] = [];

    for (const username of usernames) {
      // Create readable display name (e.g., "alice_dev" -> "Alice Dev")
      const displayName = username.split("_").map(capitalize).join(" ");

      const user = await User.create({
        clerkId: `seed_user_${Math.random().toString(36).substring(2, 15)}`,
        username,
        email: `${username}@seed.local`,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        // 👇 Your new fields populated beautifully
        name: displayName,
        bio: `Software engineer & Threads clone builder. Passionate about Next.js and Mongo. ✨`,
        website: `https://${username}.dev`,
      });
      seedUsers.push(user);
    }

    console.log(
      "📝 Generating community posts, likes, reposts, shares, and comments...",
    );
    const TOTAL_POSTS = 50;

    for (let i = 0; i < TOTAL_POSTS; i++) {
      const postAuthor =
        seedUsers[Math.floor(Math.random() * seedUsers.length)];
      const content =
        POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)] +
        ` (#${i + 1})`;

      // Helper function to get an array of random user documents for interactions
      const getRandomUsersList = () => {
        const count = Math.floor(Math.random() * (seedUsers.length + 1));
        return [...seedUsers].sort(() => 0.5 - Math.random()).slice(0, count);
      };

      const likes = getRandomUsersList().map((u) => u._id);
      const shares = getRandomUsersList().map((u) => u._id);
      const usersWhoReposted = getRandomUsersList(); // Keep full documents to generate Repost rows

      // Create the main post
      const post = await Post.create({
        userId: postAuthor._id,
        content,
        likes,
        shares,
        repostCount: usersWhoReposted.length, // 👈 Store the count directly as an integer
        commentCount: 0,
        createdAt: new Date(
          Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7,
        ),
      });

      // 👇 NEW: Generate separate collection entries for the Reposts!
      for (const user of usersWhoReposted) {
        await Repost.create({
          userId: user._id,
          postId: post._id,
          // Generate a timestamp shortly after the original post creation
          createdAt: new Date(
            post.createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 2,
          ),
        });
      }

      // Generate random comments as posts
      const commentsCount = Math.floor(Math.random() * 5);

      for (let j = 0; j < commentsCount; j++) {
        const commentAuthor =
          seedUsers[Math.floor(Math.random() * seedUsers.length)];
        const commentContent =
          COMMENT_TEMPLATES[
            Math.floor(Math.random() * COMMENT_TEMPLATES.length)
          ];

        const commentUsersWhoReposted = getRandomUsersList();

        const commentPost = await Post.create({
          userId: commentAuthor._id,
          parentId: post._id,
          content: commentContent,
          likes: getRandomUsersList().map((u) => u._id),
          shares: getRandomUsersList().map((u) => u._id),
          repostCount: commentUsersWhoReposted.length, // 👈 Integer count
          commentCount: 0,
          createdAt: new Date(
            post.createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24,
          ),
        });

        // Generate collection rows for comment reposts
        for (const user of commentUsersWhoReposted) {
          await Repost.create({
            userId: user._id,
            postId: commentPost._id,
            createdAt: new Date(
              commentPost.createdAt.getTime() + Math.random() * 1000 * 60 * 60,
            ),
          });
        }
      }

      // Update the parent post's comment count
      if (commentsCount > 0) {
        await Post.findByIdAndUpdate(post._id, {
          commentCount: commentsCount,
        });
      }
    }

    console.log(`✅ Success! Background sandbox environment seeded:`);
    console.log(
      `   - ${seedUsers.length} Constant Seed Users (with full bios and names)`,
    );
    console.log(
      `   - ${TOTAL_POSTS} Active posts, tracking metrics via integers.`,
    );
    console.log(
      `   - Repost data fully migrated into its own separate relational collection.`,
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed.");
    process.exit(0);
  }
}

seedDatabase();
