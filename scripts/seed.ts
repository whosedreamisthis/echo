// scripts/seed.ts
import mongoose from "mongoose";
import connectDB from "../lib/db";
import User from "@/models/User";
import Post from "@/models/Post";

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

async function seedDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();

    console.log("🧹 Clearing existing Users and Posts...");
    await User.deleteMany({});
    await Post.deleteMany({});

    console.log("👥 Creating seed community users...");
    const usernames = [
      "alice_dev",
      "bob_codes",
      "charlie_js",
      "dana_design",
      "evan_builds",
    ];
    const seedUsers = [];

    for (const username of usernames) {
      const user = await User.create({
        clerkId: `seed_user_${Math.random().toString(36).substring(2, 15)}`,
        username,
        email: `${username}@seed.local`,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
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

      // Helper function to get a random assortment of users for metrics
      const getRandomUserIds = () => {
        const count = Math.floor(Math.random() * (seedUsers.length + 1));
        return [...seedUsers]
          .sort(() => 0.5 - Math.random())
          .slice(0, count)
          .map((user) => user._id);
      };

      const likes = getRandomUserIds();
      const reposts = getRandomUserIds();
      const shares = getRandomUserIds();

      // Generate random comments
      const commentsCount = Math.floor(Math.random() * 5);
      const comments = [];

      for (let j = 0; j < commentsCount; j++) {
        const commentAuthor =
          seedUsers[Math.floor(Math.random() * seedUsers.length)];
        const commentContent =
          COMMENT_TEMPLATES[
            Math.floor(Math.random() * COMMENT_TEMPLATES.length)
          ];

        comments.push({
          userId: commentAuthor._id,
          content: commentContent,
          createdAt: new Date(
            Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 3,
          ),
        });
      }

      // Create the post with new interaction metrics
      await Post.create({
        userId: postAuthor._id,
        content,
        likes,
        reposts,
        shares,
        comments,
        createdAt: new Date(
          Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7,
        ),
      });
    }

    console.log(`✅ Success! Background sandbox environment seeded:`);
    console.log(`   - ${seedUsers.length} Constant Seed Users (The Community)`);
    console.log(
      `   - ${TOTAL_POSTS} Active posts populated with interactions (likes, reposts, shares, comments).`,
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
