"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = require("express-rate-limit");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const auth_1 = __importDefault(require("./routes/auth"));
const dashboard_1 = __importDefault(require("./routes/dashboard"));
const members_1 = __importDefault(require("./routes/members"));
const membershipPlans_1 = __importDefault(require("./routes/membershipPlans"));
const subscriptions_1 = __importDefault(require("./routes/subscriptions"));
const payments_1 = __importDefault(require("./routes/payments"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const trainers_1 = __importDefault(require("./routes/trainers"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const reports_1 = __importDefault(require("./routes/reports"));
const enquiries_1 = __importDefault(require("./routes/enquiries"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const settings_1 = __importDefault(require("./routes/settings"));
const cronJobs_1 = require("./jobs/cronJobs");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Trust proxy
app.set('trust proxy', 1);
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
// CORS
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
const authLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many login attempts, please try again later.',
});
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)(process.env.COOKIE_SECRET));
app.use((0, compression_1.default)());
// Logging
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('combined', {
        stream: { write: (message) => logger_1.logger.info(message.trim()) },
    }));
}
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/members', members_1.default);
app.use('/api/membership-plans', membershipPlans_1.default);
app.use('/api/subscriptions', subscriptions_1.default);
app.use('/api/payments', payments_1.default);
app.use('/api/attendance', attendance_1.default);
app.use('/api/trainers', trainers_1.default);
app.use('/api/expenses', expenses_1.default);
app.use('/api/reports', reports_1.default);
app.use('/api/enquiries', enquiries_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/settings', settings_1.default);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});
// Error handler
app.use(errorHandler_1.errorHandler);
// Start server
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        app.listen(PORT, () => {
            logger_1.logger.info(`🚀 FitManager Server running on port ${PORT}`);
            logger_1.logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
            logger_1.logger.info(`🌐 Client URL: ${process.env.CLIENT_URL}`);
        });
        // Init cron jobs
        (0, cronJobs_1.initCronJobs)();
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map