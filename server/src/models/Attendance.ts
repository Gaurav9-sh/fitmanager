import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  member: mongoose.Types.ObjectId;
  checkInTime: Date;
  checkOutTime?: Date;
  date: string; // YYYY-MM-DD for easy grouping
  recordedBy?: mongoose.Types.ObjectId; // staff who marked
  method: 'manual' | 'qr_scan' | 'self_checkin';
  membershipWarning?: string; // e.g. "expired", "expiring_soon"
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    checkInTime: { type: Date, required: true, default: Date.now },
    checkOutTime: Date,
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    method: {
      type: String,
      enum: ['manual', 'qr_scan', 'self_checkin'],
      default: 'manual',
    },
    membershipWarning: String,
    notes: String,
  },
  { timestamps: true }
);

// Prevent duplicate check-in on same day (one open session per member per day)
attendanceSchema.index({ member: 1, date: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', attendanceSchema);
