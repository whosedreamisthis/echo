# Echo - A Threads-Inspired Microblogging Platform

Echo is a modern, high-performance social media platform inspired by Threads, built with the latest web technologies. It features real-time interactions, a sophisticated feed system, and a clean, responsive UI.

## 🚀 Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication:** [Clerk](https://clerk.com/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **State Management:** [Zustand](https://docs.pmnd.rs/zustand/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [tw-animate-css](https://www.npmjs.com/package/tw-animate-css)

## ✨ Features

- **Dynamic Feed:** "For You" and "Following" feeds with smart sorting and repost prioritization.
- **Repost System:** Share content from other users with dedicated repost tracking.
- **Following System:** Build your network and see content from people you follow.
- **Rich User Profiles:** Customizable bios, profile pictures (via DiceBear/Clerk), and activity history.
- **Interaction Suite:** Like, comment, and save posts for later.
- **Real-time UI:** Optimistic updates and smooth transitions.
- **Search:** Find users and posts quickly with integrated search.

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ 
- MongoDB instance (Atlas or local)
- Clerk account and project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/echo.git
   cd echo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
   CLERK_SECRET_KEY=your_secret_key
   MONGODB_URI=your_mongodb_connection_string
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### Database Seeding

To quickly populate your local environment with community data (users, posts, follows), run:
```bash
npm run db:seed
```

## 🏗️ Project Structure

- `app/`: Next.js App Router pages and Server Actions.
- `components/`: Reusable UI components (Feed, PostCard, Nav, etc.).
- `models/`: Mongoose schemas and models (User, Post, Repost, Follow, Save).
- `lib/`: Shared utilities, types, and database configuration.
- `scripts/`: Maintenance and seeding scripts.

## 📜 License

This project is licensed under the MIT License.
