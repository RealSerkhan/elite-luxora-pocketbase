import express from 'express';
import { sendOtp,login,verifyOtp } from '../controllers/auth_controller.js';

const router = express.Router();

// ✅ Route to send OTP
router.post('/send-otp', sendOtp);

// ✅ Route to send OTP
router.post('/login', login);

// ✅ Route to send OTP
router.post('/verify-otp', verifyOtp);

export default router;