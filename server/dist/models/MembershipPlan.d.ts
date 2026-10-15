import mongoose, { Document } from 'mongoose';
export interface IMembershipPlan extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    durationDays: number;
    durationLabel: string;
    price: number;
    features: string[];
    isActive: boolean;
    isPopular: boolean;
    maxFreeze?: number;
    allowedGuestPasses?: number;
    category: 'basic' | 'standard' | 'premium' | 'personal_training';
    color?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MembershipPlan: mongoose.Model<IMembershipPlan, {}, {}, {}, mongoose.Document<unknown, {}, IMembershipPlan, {}, {}> & IMembershipPlan & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=MembershipPlan.d.ts.map