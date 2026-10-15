import mongoose, { Document } from 'mongoose';
export interface IGymSettings extends Document {
    gymName: string;
    tagline?: string;
    logo?: string;
    address: string;
    city: string;
    state?: string;
    pincode?: string;
    phone: string;
    email?: string;
    website?: string;
    currency: string;
    currencySymbol: string;
    timezone: string;
    operatingHours: {
        day: string;
        open: string;
        close: string;
        isClosed: boolean;
    }[];
    socialMedia?: {
        instagram?: string;
        facebook?: string;
        youtube?: string;
        twitter?: string;
    };
    receiptFooter?: string;
    gstNumber?: string;
    smtpConfigured: boolean;
    razorpayConfigured: boolean;
    notificationSettings: {
        expiryReminderDays: number[];
        overdueReminderDays: number[];
        inactivityAlertDays: number;
        sendEmailNotifications: boolean;
    };
    updatedAt: Date;
}
export declare const GymSettings: mongoose.Model<IGymSettings, {}, {}, {}, mongoose.Document<unknown, {}, IGymSettings, {}, {}> & IGymSettings & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=GymSettings.d.ts.map