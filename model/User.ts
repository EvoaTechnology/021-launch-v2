import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'user';
  ideaValidated: boolean;
  ideaId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, minlength: 5 },
    role: { type: String, enum: ['user'], default: 'user' },
    ideaValidated: { type: Boolean, default: false },
    ideaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea' },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;
