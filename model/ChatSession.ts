import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatSession extends Document {
  userId: string; // Changed from mongoose.Types.ObjectId to string for Supabase UUIDs
  topic: string;
  createdAt: Date;
  updatedAt: Date;
}

const chatSessionSchema = new Schema<IChatSession>(
  {
    userId: { type: String, required: true }, // Changed from ObjectId to String
    topic: { type: String },
  },
  { timestamps: true }
);

// Indexes for query performance and user isolation patterns
chatSessionSchema.index({ userId: 1, createdAt: -1 });

const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", chatSessionSchema);

export default ChatSession;
