"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const qrcode_1 = __importDefault(require("qrcode"));
const uuid_1 = require("uuid");
dotenv_1.default.config();
// Import models
const User_1 = require("../src/models/User");
const Member_1 = require("../src/models/Member");
const MembershipPlan_1 = require("../src/models/MembershipPlan");
const Subscription_1 = require("../src/models/Subscription");
const Invoice_1 = require("../src/models/Invoice");
const Trainer_1 = require("../src/models/Trainer");
const Attendance_1 = require("../src/models/Attendance");
const Expense_1 = require("../src/models/Expense");
const Enquiry_1 = require("../src/models/Enquiry");
const GymSettings_1 = require("../src/models/GymSettings");
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fitmanager';
// Helper
const randomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const MEMBER_NAMES = [
    'Arjun Sharma', 'Priya Patel', 'Ravi Kumar', 'Sneha Mehta', 'Aditya Singh',
    'Kavya Nair', 'Rohit Verma', 'Anita Gupta', 'Vikram Joshi', 'Deepa Reddy',
    'Manish Yadav', 'Pooja Iyer', 'Suresh Pillai', 'Neha Agarwal', 'Kiran Shah',
    'Rahul Mishra', 'Sunita Bose', 'Amit Tiwari', 'Lakshmi Menon', 'Gaurav Pandey',
    'Divya Kapoor', 'Sanjay Nanda', 'Meera Rao', 'Ashok Sinha',
];
const PHONES = Array.from({ length: 24 }, (_, i) => `9${String(800000000 + i).padStart(9, '0')}`);
async function seed() {
    await mongoose_1.default.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    // Clear all data
    await Promise.all([
        User_1.User.deleteMany({}),
        Member_1.Member.deleteMany({}),
        MembershipPlan_1.MembershipPlan.deleteMany({}),
        Subscription_1.Subscription.deleteMany({}),
        Invoice_1.Invoice.deleteMany({}),
        Trainer_1.Trainer.deleteMany({}),
        Attendance_1.Attendance.deleteMany({}),
        Expense_1.Expense.deleteMany({}),
        Enquiry_1.Enquiry.deleteMany({}),
        GymSettings_1.GymSettings.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');
    // =========================================
    // 1. Gym Settings
    // =========================================
    await GymSettings_1.GymSettings.create({
        gymName: 'FitManager Gym',
        tagline: 'Stronger Every Day',
        address: '42 Fitness Avenue, Andheri West',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400058',
        phone: '+91 9876543210',
        email: 'info@fitmanagergym.com',
        website: 'https://fitmanager.com',
        currency: 'INR',
        currencySymbol: '₹',
        timezone: 'Asia/Kolkata',
        operatingHours: [
            { day: 'Monday', open: '05:00', close: '22:00', isClosed: false },
            { day: 'Tuesday', open: '05:00', close: '22:00', isClosed: false },
            { day: 'Wednesday', open: '05:00', close: '22:00', isClosed: false },
            { day: 'Thursday', open: '05:00', close: '22:00', isClosed: false },
            { day: 'Friday', open: '05:00', close: '22:00', isClosed: false },
            { day: 'Saturday', open: '06:00', close: '20:00', isClosed: false },
            { day: 'Sunday', open: '07:00', close: '14:00', isClosed: false },
        ],
        socialMedia: {
            instagram: '@fitmanagergym',
            facebook: 'FitManagerGym',
            youtube: 'FitManagerGym',
        },
        smtpConfigured: false,
        razorpayConfigured: false,
        notificationSettings: {
            expiryReminderDays: [7, 3, 1],
            overdueReminderDays: [1, 3, 7],
            inactivityAlertDays: 14,
            sendEmailNotifications: false,
        },
    });
    console.log('⚙️  Gym settings created');
    // =========================================
    // 2. Membership Plans
    // =========================================
    const plans = await MembershipPlan_1.MembershipPlan.create([
        {
            name: 'Monthly Basic',
            description: 'Perfect for beginners. Access to gym floor and basic equipment.',
            durationDays: 30,
            durationLabel: '1 Month',
            price: 99900, // ₹999
            features: ['Gym Floor Access', 'Basic Equipment', 'Locker Room', 'Water Station'],
            isActive: true,
            isPopular: false,
            category: 'basic',
            color: '#6b7280',
        },
        {
            name: 'Quarterly Standard',
            description: 'Best value for committed fitness enthusiasts.',
            durationDays: 90,
            durationLabel: '3 Months',
            price: 249900, // ₹2499
            features: ['Gym Floor Access', 'All Equipment', 'Group Classes', 'Locker Room', 'Fitness Assessment', 'Diet Tips'],
            isActive: true,
            isPopular: true,
            category: 'standard',
            color: '#84cc16',
        },
        {
            name: 'Half-Yearly Premium',
            description: 'Serious training with premium benefits and trainer access.',
            durationDays: 180,
            durationLabel: '6 Months',
            price: 449900, // ₹4499
            features: ['Gym Floor Access', 'All Equipment', 'Unlimited Group Classes', 'Personal Trainer (4 sessions)', 'Nutrition Consultation', 'Body Composition Analysis', 'Guest Passes (2)'],
            isActive: true,
            isPopular: false,
            category: 'premium',
            color: '#f59e0b',
        },
        {
            name: 'Annual Elite',
            description: 'Complete fitness transformation package for the year.',
            durationDays: 365,
            durationLabel: '1 Year',
            price: 799900, // ₹7999
            features: ['Gym Floor Access', 'All Equipment', 'Unlimited Group Classes', 'Personal Trainer (12 sessions)', 'Monthly Nutrition Consultation', 'Quarterly Body Analysis', 'Guest Passes (5)', 'Free Merchandise'],
            isActive: true,
            isPopular: false,
            category: 'premium',
            color: '#8b5cf6',
        },
        {
            name: 'Personal Training',
            description: 'One-on-one personal training sessions with expert trainers.',
            durationDays: 30,
            durationLabel: '1 Month',
            price: 299900, // ₹2999
            features: ['12 PT Sessions/Month', 'Custom Workout Plan', 'Custom Diet Plan', 'Progress Tracking', 'Priority Booking'],
            isActive: true,
            isPopular: false,
            category: 'personal_training',
            color: '#ef4444',
        },
    ]);
    console.log(`💪 ${plans.length} membership plans created`);
    // =========================================
    // 3. Admin & Staff Users
    // =========================================
    const adminUser = await User_1.User.create({
        name: 'Gym Owner',
        email: process.env.ADMIN_EMAIL || 'admin@fitmanager.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
        phone: '9876543210',
        isActive: true,
    });
    const staffUser = await User_1.User.create({
        name: 'Rajesh Kumar',
        email: 'staff@fitmanager.com',
        password: 'Staff@123',
        role: 'staff',
        phone: '9876543211',
        isActive: true,
    });
    console.log('👑 Admin and staff users created');
    console.log(`   Admin: ${process.env.ADMIN_EMAIL || 'admin@fitmanager.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('   Staff: staff@fitmanager.com / Staff@123');
    // =========================================
    // 4. Trainers
    // =========================================
    const trainerData = [
        {
            name: 'Karan Mehta',
            email: 'karan.trainer@fitmanager.com',
            phone: '9876543220',
            specialties: ['Strength Training', 'Powerlifting', 'Functional Fitness'],
            qualifications: ['ACE Certified Personal Trainer', 'NASM CES'],
            experience: 6,
            bio: 'Former national-level powerlifter with 6 years of coaching experience. Specializes in building raw strength and functional movement patterns.',
            rating: 4.8,
            salary: 4500000, // ₹45,000/month in paise
        },
        {
            name: 'Priya Sharma',
            email: 'priya.trainer@fitmanager.com',
            phone: '9876543221',
            specialties: ['Yoga', 'Pilates', 'Weight Loss', 'Nutrition'],
            qualifications: ['RYT-200 Certified Yoga Instructor', 'Certified Nutritionist'],
            experience: 8,
            bio: 'Wellness expert blending yoga, pilates, and nutrition science. Helped 200+ clients achieve sustainable weight loss.',
            rating: 4.9,
            salary: 5000000,
        },
        {
            name: 'Aryan Singh',
            email: 'aryan.trainer@fitmanager.com',
            phone: '9876543222',
            specialties: ['HIIT', 'CrossFit', 'Sports Performance', 'Boxing'],
            qualifications: ['CrossFit Level 2 Trainer', 'NSCA-CSCS'],
            experience: 5,
            bio: 'High-energy trainer specializing in HIIT and sports conditioning. Ex-competitive boxer and CrossFit athlete.',
            rating: 4.7,
            salary: 4200000,
        },
    ];
    const trainerUsers = await Promise.all(trainerData.map(t => User_1.User.create({
        name: t.name, email: t.email, password: 'Trainer@123',
        role: 'trainer', phone: t.phone, isActive: true,
    })));
    const trainers = await Promise.all(trainerData.map((t, i) => Trainer_1.Trainer.create({
        userId: trainerUsers[i]._id,
        name: t.name, email: t.email, phone: t.phone,
        specialties: t.specialties, qualifications: t.qualifications,
        experience: t.experience, bio: t.bio, rating: t.rating,
        salary: t.salary, isActive: true, joinDate: new Date('2023-01-15'),
        availability: [
            { day: 'Monday', slots: ['06:00-07:00', '07:00-08:00', '17:00-18:00', '18:00-19:00'] },
            { day: 'Wednesday', slots: ['06:00-07:00', '07:00-08:00', '17:00-18:00'] },
            { day: 'Friday', slots: ['06:00-07:00', '07:00-08:00', '17:00-18:00', '19:00-20:00'] },
            { day: 'Saturday', slots: ['07:00-08:00', '08:00-09:00', '09:00-10:00'] },
        ],
    })));
    await Promise.all(trainerUsers.map((u, i) => User_1.User.findByIdAndUpdate(u._id, { trainerId: trainers[i]._id })));
    console.log(`🏋️  ${trainers.length} trainers created`);
    // =========================================
    // 5. Members (24 total)
    // =========================================
    const now = new Date();
    const members = [];
    const memberUsers = [];
    for (let i = 0; i < MEMBER_NAMES.length; i++) {
        const name = MEMBER_NAMES[i];
        const phone = PHONES[i];
        const email = `${name.toLowerCase().replace(' ', '.')}@gmail.com`;
        const joiningDate = randomDate(new Date('2023-06-01'), new Date('2024-10-01'));
        const user = await User_1.User.create({
            name, email, password: phone,
            role: 'member', phone, isActive: true,
        });
        const qrToken = (0, uuid_1.v4)();
        const qrDataUrl = await qrcode_1.default.toDataURL(JSON.stringify({ type: 'member_checkin', token: qrToken, v: 1 }), { errorCorrectionLevel: 'M', width: 256 });
        const member = await Member_1.Member.create({
            userId: user._id,
            name, email, phone,
            dateOfBirth: randomDate(new Date('1985-01-01'), new Date('2003-01-01')),
            gender: i % 3 === 0 ? 'female' : 'male',
            address: `${randomInt(1, 200)} Sample Street`,
            city: pick(['Mumbai', 'Thane', 'Navi Mumbai', 'Pune']),
            joiningDate,
            bloodGroup: pick(['A+', 'B+', 'O+', 'AB+', 'A-', 'O-']),
            fitnessGoal: pick(['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness']),
            status: 'pending', // will be updated based on subscription
            qrToken,
            qrCode: qrDataUrl,
            assignedTrainer: i < 8 ? trainers[i % 3]._id : undefined,
            createdBy: adminUser._id,
        });
        await User_1.User.findByIdAndUpdate(user._id, { memberId: member._id });
        members.push(member);
        memberUsers.push(user);
    }
    // Update trainer assigned members
    for (let i = 0; i < 8; i++) {
        const trainerIdx = i % 3;
        trainers[trainerIdx].assignedMembers.push(members[i]._id);
    }
    await Promise.all(trainers.map(t => t.save()));
    console.log(`👥 ${members.length} members created`);
    // =========================================
    // 6. Subscriptions & Invoices
    // =========================================
    // Active (15 members)
    for (let i = 0; i < 15; i++) {
        const plan = pick(plans);
        const startDate = randomDate(new Date('2024-07-01'), new Date('2024-09-01'));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.durationDays);
        const sub = await Subscription_1.Subscription.create({
            member: members[i]._id,
            plan: plan._id,
            planSnapshot: { name: plan.name, price: plan.price, durationDays: plan.durationDays, features: plan.features },
            startDate, endDate,
            status: endDate > now ? 'active' : 'expired',
            isRenewal: i > 10,
            finalPrice: plan.price,
            createdBy: adminUser._id,
        });
        const isPaid = Math.random() > 0.2;
        const isPartial = !isPaid && Math.random() > 0.5;
        const paidAmount = isPaid ? plan.price : isPartial ? Math.round(plan.price * 0.5) : 0;
        const invoice = await Invoice_1.Invoice.create({
            member: members[i]._id,
            subscription: sub._id,
            description: `${plan.name} - ${plan.durationLabel}`,
            totalAmount: plan.price,
            discountAmount: 0,
            netAmount: plan.price,
            paidAmount,
            pendingAmount: plan.price - paidAmount,
            status: isPaid ? 'paid' : isPartial ? 'partially_paid' : 'pending',
            dueDate: startDate,
            payments: isPaid ? [{
                    amount: plan.price,
                    method: pick(['cash', 'upi', 'card']),
                    paidAt: randomDate(startDate, new Date()),
                    recordedBy: adminUser._id,
                }] : isPartial ? [{
                    amount: paidAmount,
                    method: 'cash',
                    paidAt: randomDate(startDate, new Date()),
                    recordedBy: staffUser._id,
                }] : [],
            createdBy: adminUser._id,
        });
        await Member_1.Member.findByIdAndUpdate(members[i]._id, { status: sub.status === 'active' ? 'active' : 'expired' });
    }
    // Expired memberships (5 members)
    for (let i = 15; i < 20; i++) {
        const plan = plans[0]; // basic plan
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-02-01');
        await Subscription_1.Subscription.create({
            member: members[i]._id, plan: plan._id,
            planSnapshot: { name: plan.name, price: plan.price, durationDays: plan.durationDays, features: plan.features },
            startDate, endDate, status: 'expired', finalPrice: plan.price, createdBy: adminUser._id,
        });
        await Invoice_1.Invoice.create({
            member: members[i]._id, description: plan.name,
            totalAmount: plan.price, discountAmount: 0, netAmount: plan.price,
            paidAmount: plan.price, pendingAmount: 0, status: 'paid',
            dueDate: startDate,
            payments: [{ amount: plan.price, method: 'cash', paidAt: startDate, recordedBy: adminUser._id }],
            createdBy: adminUser._id,
        });
        await Member_1.Member.findByIdAndUpdate(members[i]._id, { status: 'expired' });
    }
    // Pending (4 members - no subscription, just registered)
    for (let i = 20; i < 24; i++) {
        await Member_1.Member.findByIdAndUpdate(members[i]._id, { status: 'pending' });
    }
    console.log('📋 Subscriptions and invoices created');
    // =========================================
    // 7. Attendance (last 60 days)
    // =========================================
    const activeMembers = members.slice(0, 15);
    let attendanceCount = 0;
    for (let d = 0; d < 60; d++) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        const dateStr = date.toISOString().split('T')[0];
        // Each active member attends randomly 3-5 days per week
        const attendingToday = activeMembers.filter(() => Math.random() > 0.4);
        for (const member of attendingToday) {
            const checkIn = new Date(date);
            checkIn.setHours(randomInt(5, 10), randomInt(0, 59));
            const checkOut = new Date(checkIn);
            checkOut.setHours(checkOut.getHours() + randomInt(1, 2), randomInt(0, 59));
            await Attendance_1.Attendance.create({
                member: member._id,
                checkInTime: checkIn,
                checkOutTime: checkOut,
                date: dateStr,
                recordedBy: staffUser._id,
                method: pick(['manual', 'qr_scan']),
            });
            attendanceCount++;
        }
    }
    console.log(`📊 ${attendanceCount} attendance records created`);
    // =========================================
    // 8. Expenses (last 12 months)
    // =========================================
    const expenseData = [
        { title: 'Monthly Rent', category: 'rent', amount: 8000000, recurring: true },
        { title: 'Trainer Salaries', category: 'salary', amount: 13700000, recurring: true },
        { title: 'Electricity Bill', category: 'electricity', amount: 850000, recurring: true },
        { title: 'Internet & Cable', category: 'internet', amount: 250000, recurring: true },
        { title: 'Cleaning Services', category: 'cleaning', amount: 350000, recurring: true },
        { title: 'Gym Insurance', category: 'insurance', amount: 1200000, recurring: false },
        { title: 'New Treadmill', category: 'equipment_purchase', amount: 8500000, recurring: false },
        { title: 'Dumbbell Set Replacement', category: 'equipment_purchase', amount: 2500000, recurring: false },
        { title: 'AC Servicing', category: 'equipment_maintenance', amount: 450000, recurring: false },
        { title: 'Instagram Ads', category: 'marketing', amount: 1500000, recurring: true },
        { title: 'Gym Management Software', category: 'software', amount: 500000, recurring: true },
        { title: 'Water Dispenser Refill', category: 'water', amount: 150000, recurring: true },
    ];
    for (let month = 0; month < 12; month++) {
        const monthDate = new Date(now);
        monthDate.setMonth(monthDate.getMonth() - month);
        for (const exp of expenseData) {
            if (!exp.recurring && month > 0)
                continue; // one-time expenses only in current month
            const expDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomInt(1, 28));
            await Expense_1.Expense.create({
                title: exp.title,
                category: exp.category,
                amount: exp.amount,
                date: expDate,
                paymentMethod: pick(['cash', 'upi', 'bank_transfer']),
                isRecurring: exp.recurring,
                recurringFrequency: exp.recurring ? 'monthly' : undefined,
                recordedBy: adminUser._id,
            });
        }
    }
    console.log('💸 Expenses created');
    // =========================================
    // 9. Enquiries
    // =========================================
    const enquiryData = [
        { name: 'Rahul Khanna', phone: '9988776655', message: 'I want to join the gym. What are the membership options?', status: 'new' },
        { name: 'Sunita Sharma', phone: '9977665544', message: 'Do you have yoga classes for beginners?', status: 'contacted' },
        { name: 'Mohan Das', phone: '9966554433', message: 'What is the cost of personal training sessions?', status: 'converted' },
        { name: 'Alisha Fernandez', phone: '9955443322', message: 'I am looking for weight loss programs. Can you help?', status: 'follow_up' },
        { name: 'Ravi Bhat', phone: '9944332211', message: 'Are there any offers for couples membership?', status: 'new' },
    ];
    await Enquiry_1.Enquiry.create(enquiryData.map(e => ({
        ...e,
        email: `${e.name.toLowerCase().replace(' ', '.')}@example.com`,
        source: 'website',
    })));
    console.log('📩 Enquiries created');
    // =========================================
    // Summary
    // =========================================
    console.log('\n===========================================');
    console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
    console.log('===========================================');
    console.log('\n📌 DEMO CREDENTIALS:');
    console.log(`   Admin:   ${process.env.ADMIN_EMAIL || 'admin@fitmanager.com'} / ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('   Staff:   staff@fitmanager.com / Staff@123');
    console.log('   Trainer: karan.trainer@fitmanager.com / Trainer@123');
    console.log('\n📊 DATA SUMMARY:');
    console.log(`   Members:       ${members.length} (15 active, 5 expired, 4 pending)`);
    console.log(`   Plans:         ${plans.length}`);
    console.log(`   Trainers:      ${trainers.length}`);
    console.log(`   Attendance:    ~${attendanceCount} records`);
    console.log('===========================================\n');
    await mongoose_1.default.disconnect();
}
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map