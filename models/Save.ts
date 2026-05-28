import mongoose, { Schema, Document, model, models } from "mongoose";

export interface ISave extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SaveSchema = new mongoose.Schema({
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

// CRITICAL FOR PERFORMANCE: Create a compound index.
// This ensures a user can never save the same post twice, and makes lookups instant.
SaveSchema.index({ userId: 1, postId: 1 }, { unique: true });

// module.exports = mongoose.model("Save", SaveSchema);

const Save = models.Save || model<ISave>("Save", SaveSchema);
export default Save;
