import mongoose, { Document, Schema } from 'mongoose';

export type SubscriptionStatus = 'active' | 'expired' | 'suspended' | 'cancelled' | 'pending';

export interface ISubscription extends Document {
  _id: mongoose.Types.ObjectId;
  member: mongoose.Types.ObjectId;
  plan: mongoose.Types.ObjectId;
  planSnapshot: {
    name: string;
    price: number; // paise at time of purchase
    durationDays: number;
    features: string[];
  };
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  isRenewal: boolean;
  previousSubscription?: mongoose.Types.ObjectId;
  discount?: number; // paise
  discountReason?: string;
  finalPrice: number; // paise
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  suspendedAt?: Date;
  suspendReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    plan: { type: Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    planSnapshot: {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      durationDays: { type: Number, required: true },
      features: [String],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended', 'cancelled', 'pending'],
      default: 'active',
    },
    isRenewal: { type: Boolean, default: false },
    previousSubscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    discount: { type: Number, default: 0 },
    discountReason: String,
    finalPrice: { type: Number, required: true },
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    suspendedAt: Date,
    suspendReason: String,
  },
  { timestamps: true }
);

// Virtual: compute current status from dates
subscriptionSchema.virtual('computedStatus').get(function () {
  if (this.status === 'suspended' || this.status === 'cancelled') return this.status;
  const now = new Date();
  if (now > this.endDate) return 'expired';
  if (now >= this.startDate) return 'active';
  return 'pending';
});

subscriptionSchema.index({ member: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
