import mongoose, { Document } from 'mongoose';
export interface IAttendance extends Document {
    _id: mongoose.Types.ObjectId;
    member: mongoose.Types.ObjectId;
    checkInTime: Date;
    checkOutTime?: Date;
    date: string;
    recordedBy?: mongoose.Types.ObjectId;
    method: 'manual' | 'qr_scan' | 'self_checkin';
    membershipWarning?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Attendance: mongoose.Model<IAttendance, {}, {}, {}, mongoose.Document<unknown, {}, IAttendance, {}, {}> & IAttendance & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Attendance.d.ts.map