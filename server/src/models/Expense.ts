import mongoose, { Document, Schema } from 'mongoose';

export type ExpenseCategory =
  | 'rent'
  | 'salary'
  | 'electricity'
  | 'water'
  | 'internet'
  | 'equipment_purchase'
  | 'equipment_maintenance'
  | 'marketing'
  | 'cleaning'
  | 'insurance'
  | 'software'
  | 'miscellaneous'
  | 'other';

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  category: ExpenseCategory;
  amount: number; // paise
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

const expenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'rent', 'salary', 'electricity', 'water', 'internet',
        'equipment_purchase', 'equipment_maintenance', 'marketing',
        'cleaning', 'insurance', 'software', 'miscellaneous', 'other',
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, index: true },
    description: String,
    receiptUrl: String,
    vendor: String,
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank_transfer', 'other'],
      default: 'cash',
    },
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);
