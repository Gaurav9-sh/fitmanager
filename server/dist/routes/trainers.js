"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Trainer_1 = require("../models/Trainer");
const User_1 = require("../models/User");
const Member_1 = require("../models/Member");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
// GET /api/trainers (public for website)
router.get('/', async (req, res, next) => {
    try {
        const trainers = await Trainer_1.Trainer.find({ isActive: true })
            .select('-salary -assignedMembers')
            .sort({ experience: -1 });
        res.json({ success: true, data: trainers });
    }
    catch (err) {
        next(err);
    }
});
router.use(auth_1.authenticate);
// POST /api/trainers
router.post('/', (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const { name, email, phone, specialties, qualifications, experience, bio, salary, availability, joinDate } = req.body;
        if (!name || !phone)
            throw new errorHandler_1.AppError('Name and phone are required', 400);
        const user = await User_1.User.create({
            name, email: email || `trainer_${phone}@fitmanager.local`,
            password: phone, phone, role: 'trainer',
        });
        const trainer = await Trainer_1.Trainer.create({
            userId: user._id, name, email, phone,
            specialties: specialties || [], qualifications: qualifications || [],
            experience: experience || 0, bio, salary: salary ? Math.round(salary * 100) : undefined,
            availability: availability || [], joinDate: joinDate || new Date(),
        });
        await User_1.User.findByIdAndUpdate(user._id, { trainerId: trainer._id });
        res.status(201).json({ success: true, data: trainer });
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/trainers/:id
router.put('/:id', (0, auth_1.authorize)('admin'), async (req, res, next) => {
    try {
        const updates = req.body;
        if (updates.salary)
            updates.salary = Math.round(updates.salary * 100);
        const trainer = await Trainer_1.Trainer.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        if (!trainer)
            throw new errorHandler_1.AppError('Trainer not found', 404);
        res.json({ success: true, data: trainer });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/trainers/:id/assign-member
router.post('/:id/assign-member', (0, auth_1.authorize)('admin', 'staff'), async (req, res, next) => {
    try {
        const { memberId } = req.body;
        const trainer = await Trainer_1.Trainer.findById(req.params.id);
        if (!trainer)
            throw new errorHandler_1.AppError('Trainer not found', 404);
        if (!trainer.assignedMembers.some(m => m.toString() === memberId)) {
            trainer.assignedMembers.push(memberId);
            await trainer.save();
        }
        await Member_1.Member.findByIdAndUpdate(memberId, { assignedTrainer: trainer._id });
        res.json({ success: true, data: trainer, message: 'Member assigned to trainer' });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/trainers/:id
router.get('/:id', auth_1.authenticate, async (req, res, next) => {
    try {
        const trainer = await Trainer_1.Trainer.findById(req.params.id)
            .populate('assignedMembers', 'name memberId phone status');
        if (!trainer)
            throw new errorHandler_1.AppError('Trainer not found', 404);
        res.json({ success: true, data: trainer });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=trainers.js.map