import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIdea extends Document {
  title: string;
  problem: string;
  solution: string;
  marketSize: string;
  businessModel: string;
  competitors: string;
  differentiators: string;
  ideaValidationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

const ideaSchema = new Schema<IIdea>(
  {
    title: { type: String },
    problem: { type: String },
    solution: { type: String },
    marketSize: { type: String },
    businessModel: { type: String },
    competitors: { type: String },
    differentiators: { type: String },
    ideaValidationStatus: { type: String, enum: ['pending', 'validated'], default: 'pending' },
  },
  { timestamps: true }
);

const Idea: Model<IIdea> = mongoose.models.Idea || mongoose.model<IIdea>('Idea', ideaSchema);
export default Idea;
