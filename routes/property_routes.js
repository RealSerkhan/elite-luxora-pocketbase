import express from 'express';

import { addProperty, deleteProperty, getProperties, updateProperty, getProperty, getCategories, getPopularSearches } from '../controllers/property_controller.js';
import upload from '../config/multer.js';



const fileFields = [
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 10 }
];





const router = express.Router();

// ✅ Route to get properties
router.get('/get-properties', getProperties);

// ✅ Route to add property
router.post('/add-property', upload.fields(fileFields), addProperty);

// 📌 Route to get a property
router.get('/get-property/:id', getProperty);

// 📌 Route to update property
router.put('/update-property/:id', updateProperty);

// 📌 Route to delete property
router.delete('/delete-property/:id', deleteProperty);

// ✅ Route to get propert categories
router.get('/get-categories', getCategories);

// ✅ Route to popular searches
router.get('/get-popular-searches', getPopularSearches);



export default router;