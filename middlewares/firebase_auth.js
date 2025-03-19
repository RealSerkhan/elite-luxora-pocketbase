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
        console.log("Firebase Token:", token);

        // ✅ Verify Firebase Token
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken; // Attach user data
        console.log("Decoded Firebase Token:", decodedToken);

        // ✅ Check if user exists in PocketBase
        let pbUser;
        try {
            pbUser = await pb.collection('users').getFirstListItem(`email="${decodedToken.email}"`);
            console.log("User exists in PocketBase:", pbUser);
        } catch (error) {
            console.log("User not found in PocketBase, creating new user...");

            // ✅ Create new user in PocketBase without password
            pbUser = await pb.collection('users').create({
                email: decodedToken.email,
                name: decodedToken.name || "Firebase User",
                email_visibility: true,
                auth_type: "google",
            });
        }

        console.log("PocketBase User Found/Created:", pbUser);

        console.log(decodedToken);

        // ✅ Authenticate the user using external auth (NO password required)
        const authResponse = await pb.collection('users').authWithOAuth2Code("google", token);

        // ✅ Attach PocketBase authentication token to request
        req.pocketbaseToken = authResponse.token;
        req.pocketbaseUser = pbUser;

        next();
    } catch (error) {
        console.error("Error verifying Firebase token:", error);
        return res.status(401).json({ success: false, message: "Invalid Firebase token", error: error.message });
    }
};


export default verifyFirebaseToken;