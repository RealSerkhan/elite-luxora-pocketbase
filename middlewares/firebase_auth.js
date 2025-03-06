import admin from 'firebase-admin';
import dotenv from 'dotenv';
import pb from '../config/database.js';

dotenv.config();

// ✅ Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

/**
 * 📌 Middleware: Verify Firebase Token & Sync with PocketBase
 */
const verifyFirebaseToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        // ✅ Verify Firebase Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Attach user data

        // ✅ Check if user exists in PocketBase
        let pbUser;
        try {
            pbUser = await pb.collection('users').getFirstListItem(`email="${decodedToken.email}"`);
        } catch (error) {
            // ✅ Create new user in PocketBase if not found (Set a random password)
            pbUser = await pb.collection('users').create({
                email: decodedToken.email,
                name: decodedToken.name || "Firebase User",
                emailVisibilty:true,
                auth_type: "google", // ✅ Track users who signed up with Google
                password: Math.random().toString(36).slice(-8), // ✅ Set a random password
                password_confirm: Math.random().toString(36).slice(-8)
            });
        }

        // ✅ Generate a PocketBase Authentication Token (Admin Auth)
        const adminAuth = await pb.collection('_superusers').authWithPassword(
            process.env.PB_ADMIN_EMAIL, 
            process.env.PB_ADMIN_PASSWORD
        );

        // ✅ Authenticate user using PocketBase Admin API Token
        const pbAuthToken = await pb.collection('users').authRefresh({expand:adminAuth.token});

        req.pocketbaseToken = pbAuthToken.token; // Attach PocketBase Token
        req.pocketbaseUser = pbUser; // Attach user data

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid Firebase token", error: error.message });
    }
};

export default verifyFirebaseToken;