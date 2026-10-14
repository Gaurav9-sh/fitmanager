import mongoose, { Document, Schema } from 'mongoose';

export type InvoiceStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'online' | 'other';

export interface IPayment {
  amount: number; // paise
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
  totalAmount: number; // paise
  discountAmount: number; // paise
  netAmount: number; // paise
  paidAmount: number; // paise
  pendingAmount: number; // paise (computed)
  status: InvoiceStatus;
  dueDate: Date;
  payments: IPayment[];
  receiptUrl?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  amount: { type: Number, required: true, min: 0 },
  method: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank_transfer', 'online', 'other'],
    required: true,
  },
  transactionRef: String,
  paidAt: { type: Date, default: Date.now },
  recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: String,
}, { _id: true });

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, unique: true, index: true },
    member: { type: Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    description: { type: String, required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'partially_paid', 'paid', 'overdue', 'cancelled', 'refunded'],
      default: 'pending',
    },
    dueDate: { type: Date, required: true },
    payments: [paymentSchema],
    receiptUrl: String,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Auto-generate invoice number
invoiceSchema.pre('save', async function (next) {
  if (!this.invoiceNumber) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
  // Recalculate pending amount
  this.pendingAmount = Math.max(0, this.netAmount - this.paidAmount);
  next();
});

invoiceSchema.index({ member: 1, status: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });
invoiceSchema.index({ createdAt: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
