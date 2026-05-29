import mongoose from "mongoose";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import Repost from "@/models/Repost";
import Follow from "@/models/Follow";

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
    await Follow.deleteMany({});

    console.log("👥 Creating 20 seed community users with bios...");
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
    for (const currentUser of seedUsers) {
      const targetFollowCount = Math.floor(Math.random() * 5) + 2;
      const potentialFollows = [...seedUsers]
        .filter((u) => u._id.toString() !== currentUser._id.toString())
        .sort(() => 0.5 - Math.random())
        .slice(0, targetFollowCount);

      for (const targetUser of potentialFollows) {
        await Follow.create({
          followerId: currentUser._id,
          followingId: targetUser._id,
          createdAt: new Date(
            Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30,
          ),
        });
      }
    }

    console.log(
      "📝 Generating community posts, likes, reposts, shares, and comments...",
    );
    const TOTAL_POSTS = 50;
    const createdPrimaryPosts: any[] = []; // 👈 Track posts to target during the extra repost phase

    for (let i = 0; i < TOTAL_POSTS; i++) {
      const postAuthor =
        seedUsers[Math.floor(Math.random() * seedUsers.length)];
      const content =
        POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)] +
        ` (#${i + 1})`;

      const getRandomUsersSublist = (maxCount = 3) => {
        const count = Math.floor(Math.random() * maxCount);
        return [...seedUsers].sort(() => 0.5 - Math.random()).slice(0, count);
      };

      const likes = getRandomUsersSublist(8).map((u) => u._id);
      const shares = getRandomUsersSublist(4).map((u) => u._id);

      const usersWhoReposted = getRandomUsersSublist(3);

      const post = await Post.create({
        userId: postAuthor._id,
        content,
        likes,
        shares,
        reposts: usersWhoReposted.map((u) => u._id),
        repostCount: usersWhoReposted.length,
        commentCount: 0,
        createdAt: new Date(
          Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7,
        ),
      });

      createdPrimaryPosts.push(post);

      for (const user of usersWhoReposted) {
        await Repost.create({
          userId: user._id,
          postId: post._id,
          createdAt: new Date(
            post.createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 2,
          ),
        });
      }

      const commentsCount = Math.floor(Math.random() * 3);
      for (let j = 0; j < commentsCount; j++) {
        const commentAuthor =
          seedUsers[Math.floor(Math.random() * seedUsers.length)];
        const commentContent =
          COMMENT_TEMPLATES[
            Math.floor(Math.random() * COMMENT_TEMPLATES.length)
          ];

        await Post.create({
          userId: commentAuthor._id,
          parentId: post._id,
          content: commentContent,
          likes: getRandomUsersSublist(3).map((u) => u._id),
          shares: [],
          repostCount: 0,
          commentCount: 0,
          createdAt: new Date(
            post.createdAt.getTime() + Math.random() * 1000 * 60 * 60 * 24,
          ),
        });
      }

      if (commentsCount > 0) {
        await Post.findByIdAndUpdate(post._id, { commentCount: commentsCount });
      }
    }

    // ⚡ ADDED: Generate exactly 30 explicit extra reposts to fill out timelines
    console.log(
      "🔄 Generating 30 extra standalone repost entries across random posts...",
    );
    const EXTRA_REPOSTS_COUNT = 30;
    let addedReposts = 0;

    while (addedReposts < EXTRA_REPOSTS_COUNT) {
      // Pick a random post and a random user
      const targetPost =
        createdPrimaryPosts[
          Math.floor(Math.random() * createdPrimaryPosts.length)
        ];
      const reposter = seedUsers[Math.floor(Math.random() * seedUsers.length)];

      // Ensure the author isn't reposting their own post to keep data clean
      if (targetPost.userId.toString() === reposter._id.toString()) continue;

      try {
        // Attempt to create a unique repost entry (fails gracefully if compound index triggers)
        await Repost.create({
          userId: reposter._id,
          postId: targetPost._id,
          createdAt: new Date(
            targetPost.createdAt.getTime() +
              Math.random() * 1000 * 60 * 60 * 24 * 3,
          ),
        });

        // Increment counter on parent object model safely
        await Post.findByIdAndUpdate(targetPost._id, {
          $inc: { repostCount: 1 },
          $addToSet: { reposts: reposter._id },
        });
        addedReposts++;
      } catch (err) {
        // Compound unique index caught a duplicate pair selection, pass and retry loop
        continue;
      }
    }

    console.log(
      `\n✅ Success! Database reseeded with ${TOTAL_POSTS} posts and ${addedReposts + 30} total reposts.`,
    );
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
