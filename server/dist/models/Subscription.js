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
exports.Subscription = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const subscriptionSchema = new mongoose_1.Schema({
    member: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Member', required: true, index: true },
    plan: { type: mongoose_1.Schema.Types.ObjectId, ref: 'MembershipPlan', required: true },
    planSnapshot: {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        durationDays: { type: Number, required: true },
        features: [String],
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true, index: true },
    status: {
        type: String,
        enum: ['active', 'expired', 'suspended', 'cancelled', 'pending'],
        default: 'active',
    },
    isRenewal: { type: Boolean, default: false },
    previousSubscription: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subscription' },
    discount: { type: Number, default: 0 },
    discountReason: String,
    finalPrice: { type: Number, required: true },
    notes: String,
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    suspendedAt: Date,
    suspendReason: String,
}, { timestamps: true });
// Virtual: compute current status from dates
subscriptionSchema.virtual('computedStatus').get(function () {
    if (this.status === 'suspended' || this.status === 'cancelled')
        return this.status;
    const now = new Date();
    if (now > this.endDate)
        return 'expired';
    if (now >= this.startDate)
        return 'active';
    return 'pending';
});
subscriptionSchema.index({ member: 1, status: 1 });
subscriptionSchema.index({ endDate: 1, status: 1 });
exports.Subscription = mongoose_1.default.model('Subscription', subscriptionSchema);
//# sourceMappingURL=Subscription.js.map