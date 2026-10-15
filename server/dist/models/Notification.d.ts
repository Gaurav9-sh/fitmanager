import mongoose, { Document } from 'mongoose';
export type NotificationType = 'membership_expiry' | 'fee_overdue' | 'payment_received' | 'new_member' | 'renewal_reminder' | 'inactive_member' | 'system' | 'general';
export interface INotification extends Document {
    _id: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
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
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map