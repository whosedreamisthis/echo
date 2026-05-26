import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId; // For comments
  content: string;
  likes: mongoose.Types.ObjectId[];
  reposts: mongoose.Types.ObjectId[];
  shares: mongoose.Types.ObjectId[];
  commentCount: number;
  createdAt: Date;
}

const PostSchema = new Schema<IPost>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "Post", default: null },
  content: { type: String, required: true, maxlength: 280 },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  reposts: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of User IDs
  shares: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of User IDs
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Post = models.Post || model<IPost>("Post", PostSchema);
export default Post;
