import express from 'express';
import { getDeveloperById, getDevelopers } from '../controllers/developer_controller.js';



const router = express.Router();

// ✅ Route to get transactions
router.get('/get-developers', getDevelopers);



// ✅ Route to get transaction by ID
router.get('/get-developer-by-id/:id', getDeveloperById);


export default router;