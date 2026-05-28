import mongoose, { Schema, Document, model, models } from "mongoose";
import { ISave } from "@/models/Save";

export interface IRepost extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RepostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

RepostSchema.index({ userId: 1, postId: 1 }, { unique: true });

const Repost = models.Repost || model<IRepost>("Repost", RepostSchema);
export default Repost;
