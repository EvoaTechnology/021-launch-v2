import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatSummary extends Document {
  sessionId: string;
  role: "system_summary";
  content: string;
  keyData: Array<{ type: string; value: string }>;
  indexStart: number; // inclusive index in full conversation
  indexEnd: number; // inclusive index in full conversation
  createdAt: Date;
  updatedAt: Date;
}

const chatSummarySchema = new Schema<IChatSummary>(
  {
    sessionId: { type: String, ref: "ChatSession", required: true },
    role: { type: String, enum: ["system_summary"], default: "system_summary" },
    content: { type: String, required: true },
    keyData: {
      type: [
        new Schema(
          {
            type: { type: String, required: true },
            value: { type: String, required: true },
          },
          { _id: false }
        ),
      ],
      default: [],
      required: true,
    },
    indexStart: { type: Number, required: true },
    indexEnd: { type: Number, required: true },
  },
  { timestamps: true }
);

chatSummarySchema.index({ sessionId: 1, indexStart: 1 });

const ChatSummary: Model<IChatSummary> =
  mongoose.models.ChatSummary ||
  mongoose.model<IChatSummary>("ChatSummary", chatSummarySchema);

export default ChatSummary;
