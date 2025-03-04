import express from 'express';
import { getAboutUs, updateAboutUs } from '../controllers/about_us_controller.js';

const router = express.Router();

// ✅ Public Route to Get About Us
router.get('/about', getAboutUs);

// ✅ Protected Route to Update About Us (Admin Only)
router.put('/about',updateAboutUs);

export default router;