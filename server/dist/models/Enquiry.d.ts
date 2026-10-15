import mongoose, { Document } from 'mongoose';
export type EnquiryStatus = 'new' | 'contacted' | 'converted' | 'not_interested' | 'follow_up';
export interface IEnquiry extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    phone: string;
    message: string;
    interestedIn?: string;
    source?: string;
    status: EnquiryStatus;
    assignedTo?: mongoose.Types.ObjectId;
    followUpDate?: Date;
    notes?: string;
    ip?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Enquiry: mongoose.Model<IEnquiry, {}, {}, {}, mongoose.Document<unknown, {}, IEnquiry, {}, {}> & IEnquiry & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Enquiry.d.ts.map