// models/User.ts
import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  username: string; // e.g., "whoisthewitness"
  email: string;
  profilePicture?: string;
  name: string; // New: Display Name, e.g., "The Witness"
  bio?: string; // New: Max length usually around 150-160 chars
  website?: string; // New: A clickable profile link
  createdAt: Date;
}

const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true },
  profilePicture: { type: String },

  // New Fields
  name: {
    type: String,
    required: true, // You can map this from Clerk's firstName/lastName on signup
    trim: true,
  },
  bio: {
    type: String,
    maxlength: 160,
    default: "",
  },
  website: {
    type: String,
    trim: true,
    default: "",
  },

  createdAt: { type: Date, default: Date.now },
});
const User = models.User || model<IUser>("User", UserSchema);
export default User;
