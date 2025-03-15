import express from 'express';
import { getCities } from '../controllers/location_controller.js';

const router = express.Router();

// ✅ Public Route to Get About Us
router.get('/get-cities', getCities);



export default router;