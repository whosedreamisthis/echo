// app/actions.ts
'use server'
import connectDB from '@/lib/db'
import Post from '@/models/post'
import User from '@/models/user'

async function getOrCreateDemoUser() {
    let demoUser = await User.findOne({ username: 'echo_demo_user' });

    if (!demoUser) {
        demoUser = await User.create({
            username: 'echo_demo_user',
            email: 'dev@echo.app',
            profilePicture: 'https://api.dicebear.com/7.x/bottts/svg?seed=echo' // cool robot avatar
        });
    }

    return demoUser._id;
}

export async function createEcho(content: string) {
    try {
        // Establish connection to echoCluster
        await connectDB();

        const userId = await getOrCreateDemoUser();

        // Insert the new post document into MongoDB
        const newPost = await Post.create({
            userId,
            content,
        });

        return { success: true, post: JSON.parse(JSON.stringify(newPost)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}