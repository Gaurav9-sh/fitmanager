"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Enquiry_1 = require("../models/Enquiry");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// POST /api/enquiries (public)
router.post('/', async (req, res, next) => {
    try {
        const { name, email, phone, message, interestedIn, source } = req.body;
        if (!name || !phone || !message)
            throw new errorHandler_1.AppError('Name, phone, and message are required', 400);
        const enquiry = await Enquiry_1.Enquiry.create({
            name, email, phone, message, interestedIn,
            source: source || 'website',
            ip: req.ip,
        });
        res.status(201).json({ success: true, message: 'Enquiry submitted. We will contact you soon!', data: { id: enquiry._id } });
    }
    catch (err) {
        next(err);
    }
});
router.use(auth_1.authenticate, (0, auth_1.authorize)('admin', 'staff'));
// GET /api/enquiries
router.get('/', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { status } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        const [enquiries, total] = await Promise.all([
            Enquiry_1.Enquiry.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            Enquiry_1.Enquiry.countDocuments(filter),
        ]);
        res.json({ success: true, data: enquiries, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/enquiries/:id
router.patch('/:id', async (req, res, next) => {
    try {
        const { status, notes, followUpDate, assignedTo } = req.body;
        const enquiry = await Enquiry_1.Enquiry.findByIdAndUpdate(req.params.id, { status, notes, followUpDate, assignedTo }, { new: true });
        if (!enquiry)
            throw new errorHandler_1.AppError('Enquiry not found', 404);
        res.json({ success: true, data: enquiry });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=enquiries.js.map