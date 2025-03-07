import admin from 'firebase-admin';
import dotenv from 'dotenv';
import pb from '../config/database.js';
import fs from 'fs';

dotenv.config();

// ✅ Load the service account JSON
const serviceAccount = JSON.parse(
  fs.readFileSync('./firebase-service-account.json', 'utf8')
);

// ✅ Initialize Firebase Admin SDK with cert
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // optionally specify: projectId, databaseURL, etc. if needed
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
        console.log(token);

        // ✅ Verify Firebase Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Attach user data

        // ✅ Check if user exists in PocketBase
        let pbUser;
        try {
            pbUser = await pb.collection('users').getFirstListItem(`email="${decodedToken.email}"`);
        } catch (error) {
            // ✅ Create new user in PocketBase if not found
            pbUser = await pb.collection('users').create({
                email: decodedToken.email,
                name: decodedToken.name || "Firebase User",
                emailVisibilty: true,
                auth_type: "google",
                password: Math.random().toString(36).slice(-8),
                password_confirm: Math.random().toString(36).slice(-8)
            });
        }

        // ✅ Generate a PocketBase Authentication Token (Admin Auth)
        const adminAuth = await pb.collection('_superusers').authWithPassword(
            process.env.PB_ADMIN_EMAIL, 
            process.env.PB_ADMIN_PASSWORD
        );

        // ✅ Attempt to refresh user auth with admin token
        const pbAuthToken = await pb.collection('users').authRefresh({ expand: adminAuth.token });

        req.pocketbaseToken = pbAuthToken.token;
        req.pocketbaseUser = pbUser;

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid Firebase token", error: error.message });
    }
};

export default verifyFirebaseToken;