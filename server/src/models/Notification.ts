import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'membership_expiry'
  | 'fee_overdue'
  | 'payment_received'
  | 'new_member'
  | 'renewal_reminder'
  | 'inactive_member'
  | 'system'
  | 'general';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId; // User
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedMember?: mongoose.Types.ObjectId;
  relatedInvoice?: mongoose.Types.ObjectId;
  relatedSubscription?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
  emailSent: boolean;
  emailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'membership_expiry', 'fee_overdue', 'payment_received', 'new_member',
        'renewal_reminder', 'inactive_member', 'system', 'general',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    relatedMember: { type: Schema.Types.ObjectId, ref: 'Member' },
    relatedInvoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    relatedSubscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    metadata: { type: Schema.Types.Mixed },
    emailSent: { type: Boolean, default: false },
    emailSentAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
