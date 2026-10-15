import mongoose, { Document } from 'mongoose';
export interface ITrainer extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    email?: string;
    phone: string;
    specialties: string[];
    qualifications: string[];
    experience: number;
    bio?: string;
    photo?: string;
    isActive: boolean;
    assignedMembers: mongoose.Types.ObjectId[];
    availability: {
        day: string;
        slots: string[];
    }[];
    rating?: number;
    salary?: number;
    joinDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Trainer: mongoose.Model<ITrainer, {}, {}, {}, mongoose.Document<unknown, {}, ITrainer, {}, {}> & ITrainer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Trainer.d.ts.map