"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeSelf = exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const logger_1 = require("../utils/logger");
const authenticate = async (req, res, next) => {
    try {
        let token;
        // Check HTTP-only cookie first, then Authorization header
        if (req.cookies?.token) {
            token = req.cookies.token;
        }
        else if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await User_1.User.findById(decoded.id).select('id role email isActive');
        if (!user || !user.isActive) {
            res.status(401).json({ success: false, message: 'User not found or inactive' });
            return;
        }
        req.user = { id: user._id.toString(), role: user.role, email: user.email };
        next();
    }
    catch (error) {
        logger_1.logger.warn('Authentication failed:', error);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
// Member can only access their own resources
const authorizeSelf = (paramName = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }
        const isAdminOrStaff = ['admin', 'staff'].includes(req.user.role);
        if (!isAdminOrStaff && req.params[paramName] !== req.user.id) {
            res.status(403).json({ success: false, message: 'Access denied to this resource' });
            return;
        }
        next();
    };
};
exports.authorizeSelf = authorizeSelf;
//# sourceMappingURL=auth.js.map