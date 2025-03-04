import express from 'express';
import { submitContactForm } from '../controllers/contact_controller.js';

const router = express.Router();

// ✅ Public API to submit contact form
router.post('/contact', submitContactForm);

export default router;