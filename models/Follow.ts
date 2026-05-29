import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IFollow extends Document {
  followerId: mongoose.Types.ObjectId; // The user WHO IS FOLLOWING
  followingId: mongoose.Types.ObjectId; // The user BEING FOLLOWED
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>({
  followerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  followingId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// A user can't follow the same person twice
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
// Optimize for searching who a specific user is following
FollowSchema.index({ followerId: 1 });

const Follow = models.Follow || model<IFollow>("Follow", FollowSchema);
export default Follow;
