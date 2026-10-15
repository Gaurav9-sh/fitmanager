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
exports.Member = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const memberSchema = new mongoose_1.Schema({
    memberId: {
        type: String,
        unique: true,
        index: true,
    },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    alternatePhone: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: String,
    city: String,
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String,
    },
    joiningDate: { type: Date, required: true, default: Date.now },
    profilePhoto: String,
    bloodGroup: String,
    fitnessGoal: String,
    medicalNotes: String,
    assignedTrainer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Trainer' },
    status: {
        type: String,
        enum: ['active', 'expired', 'suspended', 'pending'],
        default: 'pending',
    },
    isActive: { type: Boolean, default: true },
    qrCode: String,
    qrToken: {
        type: String,
        unique: true,
        default: () => (0, uuid_1.v4)(),
        index: true,
    },
    notes: String,
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
// Auto-generate memberId before save
memberSchema.pre('save', async function (next) {
    if (!this.memberId) {
        const count = await mongoose_1.default.model('Member').countDocuments();
        this.memberId = `FM-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});
exports.Member = mongoose_1.default.model('Member', memberSchema);
//# sourceMappingURL=Member.js.map