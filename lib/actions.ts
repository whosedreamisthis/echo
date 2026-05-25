// app/actions.ts
'use server'
import connectDB from '@/lib/db'
import Post from '@/models/post'

export async function createEcho(username: string, content: string) {
    try {
        // Establish connection to echoCluster
        await connectDB();

        // Insert the new post document into MongoDB
        const newPost = await Post.create({
            username,
            content,
        });

        return { success: true, post: JSON.parse(JSON.stringify(newPost)) };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}