import mongoose, { Document, Schema } from 'mongoose';

export type EnquiryStatus = 'new' | 'contacted' | 'converted' | 'not_interested' | 'follow_up';

export interface IEnquiry extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  message: string;
  interestedIn?: string; // membership plan or service
  source?: string; // walk-in, website, referral
  status: EnquiryStatus;
  assignedTo?: mongoose.Types.ObjectId;
  followUpDate?: Date;
  notes?: string;
  ip?: string;
  createdAt: Date;
  updatedAt: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    interestedIn: String,
    source: { type: String, default: 'website' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'not_interested', 'follow_up'],
      default: 'new',
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    followUpDate: Date,
    notes: String,
    ip: String,
  },
  { timestamps: true }
);

export const Enquiry = mongoose.model<IEnquiry>('Enquiry', enquirySchema);
