import express from 'express';
import { getMortgageFaqs } from '../controllers/mortgage_controller.js';

const router = express.Router();

// ✅ Public Route to Get Mortgage Faqs
router.get('/mortgage-faqs', getMortgageFaqs);



export default router;