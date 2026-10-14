import mongoose, { Document, Schema } from 'mongoose';

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

const gymSettingsSchema = new Schema<IGymSettings>(
  {
    gymName: { type: String, default: 'FitManager Gym' },
    tagline: String,
    logo: String,
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: String,
    pincode: String,
    phone: { type: String, default: '' },
    email: String,
    website: String,
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    operatingHours: [
      {
        day: String,
        open: String,
        close: String,
        isClosed: { type: Boolean, default: false },
      },
    ],
    socialMedia: {
      instagram: String,
      facebook: String,
      youtube: String,
      twitter: String,
    },
    receiptFooter: String,
    gstNumber: String,
    smtpConfigured: { type: Boolean, default: false },
    razorpayConfigured: { type: Boolean, default: false },
    notificationSettings: {
      expiryReminderDays: { type: [Number], default: [7, 3, 1] },
      overdueReminderDays: { type: [Number], default: [1, 3, 7] },
      inactivityAlertDays: { type: Number, default: 14 },
      sendEmailNotifications: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const GymSettings = mongoose.model<IGymSettings>('GymSettings', gymSettingsSchema);
