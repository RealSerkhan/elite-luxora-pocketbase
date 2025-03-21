import express from 'express';
import { searchAutocomplete } from '../controllers/search_controller.js';

const router = express.Router();

// ✅ Public Route to Get About Us
router.get('/search-auto-complete-properties', searchAutocomplete);



export default router;