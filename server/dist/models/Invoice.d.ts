import mongoose, { Document } from 'mongoose';
export type InvoiceStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'online' | 'other';
export interface IPayment {
    amount: number;
    method: PaymentMethod;
    transactionRef?: string;
    paidAt: Date;
    recordedBy: mongoose.Types.ObjectId;
    notes?: string;
}
export interface IInvoice extends Document {
    _id: mongoose.Types.ObjectId;
    invoiceNumber: string;
    member: mongoose.Types.ObjectId;
    subscription?: mongoose.Types.ObjectId;
    description: string;
    totalAmount: number;
    discountAmount: number;
    netAmount: number;
    paidAmount: number;
    pendingAmount: number;
    status: InvoiceStatus;
    dueDate: Date;
    payments: IPayment[];
    receiptUrl?: string;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Invoice: mongoose.Model<IInvoice, {}, {}, {}, mongoose.Document<unknown, {}, IInvoice, {}, {}> & IInvoice & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Invoice.d.ts.map