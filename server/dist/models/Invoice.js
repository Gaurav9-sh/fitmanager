"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const paymentSchema = new mongoose_1.Schema({
    amount: { type: Number, required: true, min: 0 },
    method: {
        type: String,
        enum: ['cash', 'upi', 'card', 'bank_transfer', 'online', 'other'],
        required: true,
    },
    transactionRef: String,
    paidAt: { type: Date, default: Date.now },
    recordedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: String,
}, { _id: true });
const invoiceSchema = new mongoose_1.Schema({
    invoiceNumber: { type: String, unique: true, index: true },
    member: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    subscription: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subscription' },
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
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
// Auto-generate invoice number
invoiceSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        const count = await mongoose_1.default.model('Invoice').countDocuments();
        this.invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    }
    // Recalculate pending amount
    this.pendingAmount = Math.max(0, this.netAmount - this.paidAmount);
    next();
});
invoiceSchema.index({ member: 1, status: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });
invoiceSchema.index({ createdAt: 1 });
exports.Invoice = mongoose_1.default.model('Invoice', invoiceSchema);
//# sourceMappingURL=Invoice.js.map