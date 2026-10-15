import mongoose, { Document } from 'mongoose';
export type MemberStatus = 'active' | 'expired' | 'suspended' | 'pending';
export interface IEmergencyContact {
    name: string;
    phone: string;
    relationship: string;
}
export interface IMember extends Document {
    _id: mongoose.Types.ObjectId;
    memberId: string;
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
    qrCode?: string;
    qrToken: string;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Member: mongoose.Model<IMember, {}, {}, {}, mongoose.Document<unknown, {}, IMember, {}, {}> & IMember & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Member.d.ts.map