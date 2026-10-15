import mongoose, { Document } from 'mongoose';
export type ExpenseCategory = 'rent' | 'salary' | 'electricity' | 'water' | 'internet' | 'equipment_purchase' | 'equipment_maintenance' | 'marketing' | 'cleaning' | 'insurance' | 'software' | 'miscellaneous' | 'other';
export interface IExpense extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    category: ExpenseCategory;
    amount: number;
    date: Date;
    description?: string;
    receiptUrl?: string;
    vendor?: string;
    paymentMethod: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';
    isRecurring: boolean;
    recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    recordedBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Expense: mongoose.Model<IExpense, {}, {}, {}, mongoose.Document<unknown, {}, IExpense, {}, {}> & IExpense & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Expense.d.ts.map