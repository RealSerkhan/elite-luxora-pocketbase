import express from 'express';
import { addToFavorites,removeFromFavorites,getFavorites } from '../controllers/user_controller.js';
import authenticateUser from '../middlewares/auth_middleware.js';


const router = express.Router();

// ✅ Route to get favorites
router.get('/get-favorites',authenticateUser, getFavorites);

// ✅ Route to add favorite
router.post('/add-to-favorite',authenticateUser, addToFavorites);


// 📌 Route to delete favorite
router.delete('/remove-from-favorite',authenticateUser, removeFromFavorites);


export default router;