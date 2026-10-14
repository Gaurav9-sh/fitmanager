import mongoose, { Document, Schema } from 'mongoose';

export interface IMembershipPlan extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  durationDays: number; // 30, 90, 180, 365
  durationLabel: string; // "1 Month", "3 Months", etc.
  price: number; // in paise (INR * 100)
  features: string[];
  isActive: boolean;
  isPopular: boolean;
  maxFreeze?: number; // days a member can freeze
  allowedGuestPasses?: number;
  category: 'basic' | 'standard' | 'premium' | 'personal_training';
  color?: string; // for UI display
  createdAt: Date;
  updatedAt: Date;
}

const membershipPlanSchema = new Schema<IMembershipPlan>(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    durationDays: { type: Number, required: true },
    durationLabel: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }, // paise
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    maxFreeze: { type: Number, default: 0 },
    allowedGuestPasses: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ['basic', 'standard', 'premium', 'personal_training'],
      default: 'standard',
    },
    color: { type: String, default: '#84cc16' },
  },
  { timestamps: true }
);

export const MembershipPlan = mongoose.model<IMembershipPlan>('MembershipPlan', membershipPlanSchema);
