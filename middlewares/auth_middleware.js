import pb from '../config/database.js';


const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
        }

        const auth_data = await pb.collection('users').authRefresh(token);
        req.user = auth_data.record; 
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export const isUserRegistered = async (email) => {
    try {
        // 🔹 Query users collection with email filter
        await pb.collection('users').getFirstListItem(`email="${email}"`);

        // ✅ Return true if user exists
        return true;
    } catch (error) {
        console.log("Error checking user registration:", error);
        return false;
    }
};
export default authenticateUser;