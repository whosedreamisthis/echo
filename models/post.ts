// models/Post.ts
import mongoose, { Schema, Document, model, models } from 'mongoose';

// 1. Define an interface for TypeScript type-safety
export interface IPost extends Document {
    username: string;
    content: string;
    likes: number;
    createdAt: Date;
}

// 2. Define the structural rules for MongoDB
const PostSchema = new Schema<IPost>({
    username: {
        type: String,
        required: [true, 'A username is required to post an Echo.'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Your Echo cannot be empty.'],
        maxlength: [280, 'Echoes are limited to 280 characters.']
    },
    likes: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 3. Export the model, ensuring Next.js doesn't recreate it on reload
const Post = models.Post || model<IPost>('Post', PostSchema);
export default Post;