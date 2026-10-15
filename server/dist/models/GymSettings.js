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
exports.GymSettings = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const gymSettingsSchema = new mongoose_1.Schema({
    gymName: { type: String, default: 'FitManager Gym' },
    tagline: String,
    logo: String,
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: String,
    pincode: String,
    phone: { type: String, default: '' },
    email: String,
    website: String,
    currency: { type: String, default: 'INR' },
    currencySymbol: { type: String, default: '₹' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    operatingHours: [
        {
            day: String,
            open: String,
            close: String,
            isClosed: { type: Boolean, default: false },
        },
    ],
    socialMedia: {
        instagram: String,
        facebook: String,
        youtube: String,
        twitter: String,
    },
    receiptFooter: String,
    gstNumber: String,
    smtpConfigured: { type: Boolean, default: false },
    razorpayConfigured: { type: Boolean, default: false },
    notificationSettings: {
        expiryReminderDays: { type: [Number], default: [7, 3, 1] },
        overdueReminderDays: { type: [Number], default: [1, 3, 7] },
        inactivityAlertDays: { type: Number, default: 14 },
        sendEmailNotifications: { type: Boolean, default: false },
    },
}, { timestamps: true });
exports.GymSettings = mongoose_1.default.model('GymSettings', gymSettingsSchema);
//# sourceMappingURL=GymSettings.js.map