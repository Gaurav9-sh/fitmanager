import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type MemberStatus = 'active' | 'expired' | 'suspended' | 'pending';

export interface IEmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface IMember extends Document {
  _id: mongoose.Types.ObjectId;
  memberId: string; // unique human-readable ID e.g. FM-0001
  userId: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  emergencyContact?: IEmergencyContact;
  joiningDate: Date;
  profilePhoto?: string;
  bloodGroup?: string;
  fitnessGoal?: string;
  medicalNotes?: string;
  assignedTrainer?: mongoose.Types.ObjectId;
  status: MemberStatus;
  isActive: boolean;
  qrCode?: string; // base64 QR
  qrToken: string; // secure token for QR scan
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    memberId: {
      type: String,
      unique: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    alternatePhone: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: String,
    city: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    joiningDate: { type: Date, required: true, default: Date.now },
    profilePhoto: String,
    bloodGroup: String,
    fitnessGoal: String,
    medicalNotes: String,
    assignedTrainer: { type: Schema.Types.ObjectId, ref: 'Trainer' },
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended', 'pending'],
      default: 'pending',
    },
    isActive: { type: Boolean, default: true },
    qrCode: String,
    qrToken: {
      type: String,
      unique: true,
      default: () => uuidv4(),
      index: true,
    },
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Auto-generate memberId before save
memberSchema.pre('save', async function (next) {
  if (!this.memberId) {
    const count = await mongoose.model('Member').countDocuments();
    this.memberId = `FM-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

export const Member = mongoose.model<IMember>('Member', memberSchema);
