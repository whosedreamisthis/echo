// models/User.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  username: string;
  email: string;
  profilePicture?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  username: {
    type: String,
    required: [true, "Username is required."],
    unique: true, // Prevents duplicate handles on Echo
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: true,
    trim: true,
    lowercase: true,
  },
  profilePicture: {
    type: String,
    default: "https://placeholder.com/avatar.png", // Default avatar fallback
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = models.User || model<IUser>("User", UserSchema);
export default User;
