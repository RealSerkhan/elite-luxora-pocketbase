import express from 'express';
import { sendOtp,login,verifyOtp } from '../controllers/auth_controller.js';
import verifyFirebaseToken from '../middlewares/firebase_auth.js';


const router = express.Router();

// ✅ Route to send OTP
router.post('/send-otp', sendOtp);

// ✅ Route to send OTP
router.post('/login', login);

// ✅ Route to send OTP
router.post('/verify-otp', verifyOtp);


// ✅ Login via Firebase & Sync with PocketBase
router.get('/firebase', verifyFirebaseToken, (req, res) => {
    res.json({
        success: true,
        message: "Firebase Sign-In Successful",
        firebase_user: req.user,
        pocketbase_token: req.pocketbaseToken,
        pocketbase_user: req.pocketbaseUser
    });
});

// ✅ Logout
router.get('/logout', (req, res) => {
    res.json({ success: true, message: "User logged out" });
});

export default router;