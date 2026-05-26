import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IComment {
  userId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  reposts: mongoose.Types.ObjectId[];
  shares: mongoose.Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 140 },
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new Schema<IPost>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true, maxlength: 280 },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  reposts: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of User IDs
  shares: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of User IDs
  comments: [CommentSchema],
  createdAt: { type: Date, default: Date.now },
});

const Post = models.Post || model<IPost>("Post", PostSchema);
export default Post;
