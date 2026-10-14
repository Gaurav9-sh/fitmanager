import mongoose, { Document, Schema } from 'mongoose';

export interface ITrainer extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  specialties: string[];
  qualifications: string[];
  experience: number; // years
  bio?: string;
  photo?: string;
  isActive: boolean;
  assignedMembers: mongoose.Types.ObjectId[];
  availability: {
    day: string;
    slots: string[];
  }[];
  rating?: number;
  salary?: number; // paise per month
  joinDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const trainerSchema = new Schema<ITrainer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true },
    specialties: [{ type: String }],
    qualifications: [{ type: String }],
    experience: { type: Number, default: 0 },
    bio: String,
    photo: String,
    isActive: { type: Boolean, default: true },
    assignedMembers: [{ type: Schema.Types.ObjectId, ref: 'Member' }],
    availability: [
      {
        day: String,
        slots: [String],
      },
    ],
    rating: { type: Number, min: 0, max: 5 },
    salary: Number, // paise
    joinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Trainer = mongoose.model<ITrainer>('Trainer', trainerSchema);
