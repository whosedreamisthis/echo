import mongoose from "mongoose";
import connectDB from "../lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Repost from "@/models/Repost";
import Follow from "@/models/Follow"; // 👈 Import your new Follow model

const POST_TEMPLATES = [
  "Just deploying my new Next.js app. The DX is incredible! 🚀",
  "Is it just me, or is database seeding oddly satisfying?",
  "Remember to take breaks, drink water, and stretch your back today, devs! 💧",
  "Switched from relational to MongoDB for this project, and embedding comments was the best decision.",
  "What is your favorite CSS framework in 2026 and why is it still Tailwind?",
  "Coffee is brewed. Code is open. Let's build something awesome today.",
  "Server Actions are changing the game for full-stack developer speed.",
  "Just debugged an issue for 3 hours only to realize it was a typo in an env variable.",
];

const COMMENT_TEMPLATES = [
  "Totally agree with this!",
  "Nice work! Can you share the repo?",
  "This saved me hours of debugging.",
  "Haha, so true.",
  "Interesting take, but have you considered performance edge cases?",
  "Love the energy here! 🙌",
];

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

async function seedDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await connectDB();

    console.log("🧹 Clearing existing Users, Posts, Reposts, and Follows...");
    await User.deleteMany({});
    await Post.deleteMany({});
    await Repost.deleteMany({});
    await Follow.deleteMany({}); // 👈 Clear previous follow entries

    console.log("👥 Creating 20 seed community users with bios...");
    // Expanded user pool (Original 5 + 15 brand new ones)
    const usernames = [
      "alice_dev",
      "bob_codes",
      "charlie_js",
      "dana_design",
      "evan_builds",
      "fiona_stack",
      "george_ts",
      "hannah_next",
      "ian_mongo",
      "julia_query",
      "kevin_ui",
      "lara_api",
      "matt_cloud",
      "nina_react",
      "oscar_css",
      "paige_edge",
      "quinn_git",
      "ryan_auth",
      "sara_server",
      "tom_vercel",
    ];
    const seedUsers: any[] = [];

    for (const username of usernames) {
      const displayName = username.split("_").map(capitalize).join(" ");

      const user = await User.create({
        clerkId: `seed_user_${Math.random().toString(36).substring(2, 15)}`,
        username,
        email: `${username}@seed.local`,
        profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        name: displayName,
        bio: `Software engineer & Threads clone builder. Passionate about Next.js and Mongo. ✨`,
        website: `https://${username}.dev`,
      });
      seedUsers.push(user);
    }

    console.log("🤝 Generating random follower networks...");
    // Loop through users to build follower graphs
    for (const currentUser of seedUsers) {
      // Each user will randomly follow between 4 to 12 other developers
      const targetFollowCount = Math.floor(Math.random() * 9) + 4;

      // Shuffle user list and filter out self-following
      const potentialFollows = [...seedUsers]
        .filter((u) => u._id.toString() !== currentUser._id.toString())
        .sort(() => 0.5 - Math.random())
        .slice(0, targetFollowCount);

      for (const targetUser of potentialFollows) {
        await Follow.create({
          followerId: currentUser._id, // The user initiating the follow
          followingId: targetUser._id, // The user receiving the follow
          createdAt: new Date(
            Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30, // Followed within the last month
          ),
        });
      }
    }

    console.log(
      "📝 Generating community posts, likes, reposts, shares, and comments...",
    );
    const TOTAL_POSTS = 75; // Bumped up slightly to account for more users

    for (let i = 0; i < TOTAL_POSTS; i++) {
      const postAuthor =
        seedUsers[Math.floor(Math.random() * seedUsers.length)];
      const content =
        POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)] +
        ` (#${i + 1})`;

      const getRandomUsersList = () => {
        const count = Math.floor(Math.random() * (seedUsers.length + 1));
        return [...seedUsers].sort(() => 0.5 - Math.random()).slice(0, count);
      };

      const likes = getRandomUsersList().map((u) => u._id);
      const shares = getRandomUsersList().map((u) => u._id);
      const usersWhoReposted = getRandomUsersList();

      // Create main post
      const post = await Post.create({
        userId: postAuthor._id,
        content,
        likes,
        shares,
        repostCount: usersWhoReposted.length,
        commentCount: 0,
        createdAt: new Date(
          Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7,
        ),
      });

      // Generate collection entries for Reposts
      for (const user of usersWhoReposted) {
        await Repost.create({
          userId: user._id,
          postId: post._id,
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
          repostCount: commentUsersWhoReposted.length,
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

      // Update parent post comment counts
      if (commentsCount > 0) {
        await Post.findByIdAndUpdate(post._id, {
          commentCount: commentsCount,
        });
      }
    }

    // Output stats
    const actualFollowsCount = await Follow.countDocuments();
    console.log(
      `\n✅ Success! Sandbox environment seeded with following graph definitions:`,
    );
    console.log(
      `   - ${seedUsers.length} Active Seed Users (Expanded community sandbox)`,
    );
    console.log(
      `   - ${actualFollowsCount} Randomized structural social follow combinations created`,
    );
    console.log(
      `   - ${TOTAL_POSTS} Base feed posts with embedded relational properties generated`,
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
