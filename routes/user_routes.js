import express from 'express';
import { addToFavorites,removeFromFavorites,getFavorites, updateUser, getUserDetails } from '../controllers/user_controller.js';
import authenticateUser from '../middlewares/auth_middleware.js';
import upload from '../config/multer.js';


const router = express.Router();

// ✅ Route to get user
router.get('/get-user',authenticateUser, getUserDetails);


// ✅ Route to get favorites
router.get('/get-favorites',authenticateUser, getFavorites);

// ✅ Route to add favorite
router.post('/add-to-favorite',authenticateUser, addToFavorites);


// 📌 Route to delete favorite
router.delete('/remove-from-favorite',authenticateUser, removeFromFavorites);


router.post('/update-user',authenticateUser,upload.single('avatar'), updateUser);



export default router;