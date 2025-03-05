import pb from '../config/database.js';
import transporter from '../config/mailer.js';
import { isValidEmail } from '../utils/validation.js';



/**
 * 📌 User Login API
 */
export const login= async (req, res) => {
    try {
        const { email, password } = req.body;

        // Authenticate user with PocketBase
        const authData = await pb.collection('users').authWithPassword(email, password);

        res.json({
            success: true,
            token: authData.token,
            user: authData.record,
        });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid email or password" });
    }
};

/**
 * 📌 Send OTP to Email
 */
export const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
   
        let tempUser = null;

        if(!isValidEmail(email)){
            return res.status(400).json({ success: false, message: "Email is not valid" });
        }
        try {
            await pb.collection('users').getFirstListItem(`email="${email}"`);
            return res.status(400).json({ success: false, message: "Email is already in use" });

        } catch (error) {
            console.log("User user not found, proceeding with checking temp user.");
        }

        try {
            // ✅ Check if OTP was recently sent
            tempUser = await pb.collection('temporaryUsers').getFirstListItem(`email="${email}"`);
        } catch (error) {
            console.log("Temporary user not found, proceeding with OTP generation.");
        }

        // ✅ If an OTP was found, check its timestamp
        if (tempUser) {
            const createdAt = new Date(tempUser.created); // Convert timestamp to Date
            const currentTime = new Date();
            const timeDiff = (currentTime - createdAt) / 1000; // Difference in seconds

            if (timeDiff < 60) {
                return res.status(400).json({ success: false, message: "Please wait before requesting another OTP." });
            }

            // ✅ If more than 1 minute has passed, delete the old OTP
            await pb.collection('temporaryUsers').delete(tempUser.id);
        }

        // ✅ Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // ✅ Store new OTP in PocketBase
        await pb.collection('temporaryUsers').create({
            "email": email,
            "otp": otp
        });

        // ✅ Send OTP via Email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for Registration",
            text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
        });

        res.json({ success: true, message: "OTP sent to email" });
    } catch (error) {
        console.log(error);

        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * 📌 Step 2: Verify OTP and Complete Registration
 */
export const verifyOtp= async (req, res) => {
    try {
        const { email, otp, password, passwordConfirm } = req.body;

        console.log("Verifying OTP for email:", email);

        // Retrieve the stored OTP from "temporaryUsers"
        let tempUser;
        try {
            tempUser = await pb.collection('temporaryUsers').getFirstListItem(`email="${email}"`);
        } catch (error) {
            return res.status(400).json({ success: false, message: "OTP expired or not found. Please request a new OTP." });
        }

        console.log("Temporary user found:", tempUser);

        // Check if OTP matches
        if (tempUser.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Ensure passwords match
        if (password !== passwordConfirm) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        // ✅ Create a new user in the "users" collection
        const newUser = await pb.collection('users').create({
            email,
            password,
            passwordConfirm
        });

        console.log("User registered successfully:", newUser);

        // ✅ Delete temporary user record after successful registration
        await pb.collection('temporaryUsers').delete(tempUser.id);

        res.json({ success: true, message: "Registration complete. You can now log in." });
    } catch (error) {
        console.error("Error in /api/verify-otp:", error);
        res.status(400).json({ success: false, message: "Error verifying OTP" });
    }
};


/**
 * 📌 Request Password Reset (Generate & Send OTP)
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // 🔹 Send reset email via PocketBase
        await pb.collection('users').requestPasswordReset(email);

        res.json({ success: true, message: "Password reset email sent" });
    } catch (error) {
        res.status(400).json({ success: false, message: "Failed to send password reset email" });
    }
};

/**
 * 📌 Confirm Password Reset (Set New Password)
 */
export const confirmPasswordReset = async (req, res) => {
    try {
        const { token, new_password, confirm_password } = req.body;

        if (!token || !new_password || !confirm_password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (new_password !== confirm_password) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }

        // 🔹 Confirm password reset using PocketBase
        await pb.collection('users').confirmPasswordReset(token, new_password, confirm_password);

        res.json({ success: true, message: "Password has been successfully reset" });
    } catch (error) {
        res.status(400).json({ success: false, message: "Failed to reset password", error: error.message });
    }
};