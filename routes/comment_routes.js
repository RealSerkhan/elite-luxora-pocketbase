import express from 'express';
import { getComments } from '../controllers/comments_controller.js';

const router = express.Router();

// ✅ Public Route to Get About Us
router.get('/get-comments', getComments);



export default router;