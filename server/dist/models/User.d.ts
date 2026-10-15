import mongoose, { Document } from 'mongoose';
export type UserRole = 'admin' | 'staff' | 'trainer' | 'member';
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
    avatar?: string;
    isActive: boolean;
    lastLogin?: Date;
    passwordChangedAt?: Date;
    memberId?: mongoose.Types.ObjectId;
    trainerId?: mongoose.Types.ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map