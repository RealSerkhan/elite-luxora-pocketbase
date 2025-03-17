import pb from '../config/database.js';
import BaseResponse from '../models/base_response.js';
import Property from '../models/property.js';
import User from '../models/user.js';
import { getLanguage } from '../utils/get_language.js';
import fs from 'fs';





/**
 * 📌 Update User Profile
 */

export const updateUser = async (req, res) => {
        try {
            const userId = req.user.id; // ✅ Get user ID from auth middleware
            const updates = req.body;  // ✅ Text fields
            const file = req.file;  // ✅ Image file (if uploaded)
    
            // 🔹 Ensure user exists
            const user = await pb.collection('users').getOne(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found." });
            }
    
            // 🔹 Prevent Updating Email
            if (updates.email) {
                return res.status(400).json({ success: false, message: "Email cannot be updated." });
            }
    
            // ✅ Handle Profile Image Update
            if (file) {
                // 🔹 Delete old image (Optional)
                if (user.avatar) {
                    await pb.collection('users').update(userId, { avatar: null });
                }
    
                // 🔹 Upload new image to PocketBase
                const formData = new FormData();
                formData.append('avatar', fs.createReadStream(file.path), file.originalname);
                const uploadResponse = await pb.collection('users').update(userId, formData);
    
                // 🔹 Cleanup temp file
                fs.unlinkSync(file.path);
    
                // 🔹 Update new profile image in user data
                updates.profile_image = uploadResponse.profile_image;
            }
    
            // ✅ Update user record in PocketBase
            const updatedUser = await pb.collection('users').update(userId, updates);
    
            res.json(new BaseResponse(true,new User(updatedUser),null));

    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating user", error: error.message });
    }
};



/**
 * 📌 Add a property to favorites
 */
export const addToFavorites=  async (req, res) => {
    try {
        const { property_id } = req.body;
        const user_id = req.user.id;

        let existing_favorite = null;
        try {
            existing_favorite = await pb.collection('favorites').getFirstListItem(
                `user_id="${user_id}" && property_id="${property_id}"`
            );
        } catch (err) {
            console.log("No existing favorite found, proceeding.");
        }

        if (existing_favorite) {
            return res.status(400).json({ success: false, message: "Property already favorited" });
        }

        const favorite = await pb.collection('favorites').create({
            user_id,
            property_id
        });

        res.json({ success: true, message: "Property added to favorites",data: favorite });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};


/**
 * 📌 Remove a property from favorites
 */
export const removeFromFavorites =async (req, res) => {
    try {
        const { property_id } = req.body;
        const user_id = req.user.id;

        const favorite = await pb.collection('favorites').getFirstListItem(
            `user_id="${user_id}" && property_id="${property_id}"`
        );

        if (!favorite) {
            return res.status(400).json({ success: false, message: "Favorite not found" });
        }

        await pb.collection('favorites').delete(favorite.id);

        res.json({ success: true, message: "Property removed from favorites" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * 📌 Get user favorites
 */
export const getFavorites= async (req, res) => {
    try {
        const user_id = req.user.id;

        const favorites = await pb.collection('favorites').getFullList({
            filter: `user_id="${user_id}"`,
            expand: 'property_id'
        });

        const properties = favorites
            .map(fav =>fav.expand?.property_id? new Property(fav.expand?.property_id,getLanguage(req)):undefined)
            .filter(property => property !== undefined);

        res.json({ success: true, data: properties });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
/**
 * 📌 Get a User Data
 */
export const getUserDetails = async (req, res) => {
    try {
        const userId = req.user.id;

        // ✅ Fetch user data from PocketBase
        const userData = await pb.collection("users").getOne(userId);

        // ✅ Transform raw data into a structured User model
        const user = new User(userData);

        res.json(new BaseResponse(true,user,null));
    } catch (error) {
        res.status(404).json( new BaseResponse(false,null,"Couldn't get user data"));
    }
};