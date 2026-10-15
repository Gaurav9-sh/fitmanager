import mongoose, { Document } from 'mongoose';
export type SubscriptionStatus = 'active' | 'expired' | 'suspended' | 'cancelled' | 'pending';
export interface ISubscription extends Document {
    _id: mongoose.Types.ObjectId;
    member: mongoose.Types.ObjectId;
    plan: mongoose.Types.ObjectId;
    planSnapshot: {
        name: string;
        price: number;
        durationDays: number;
        features: string[];
    };
    startDate: Date;
    endDate: Date;
    status: SubscriptionStatus;
    isRenewal: boolean;
    previousSubscription?: mongoose.Types.ObjectId;
    discount?: number;
    discountReason?: string;
    finalPrice: number;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    suspendedAt?: Date;
    suspendReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Subscription: mongoose.Model<ISubscription, {}, {}, {}, mongoose.Document<unknown, {}, ISubscription, {}, {}> & ISubscription & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Subscription.d.ts.map