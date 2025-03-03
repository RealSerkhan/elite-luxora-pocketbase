import express from 'express';
import { addProperty, deleteProperty, getProperties, updateProperty,getProperty } from '../controllers/property_controller.js';

const router = express.Router();

// ✅ Route to get properties
router.get('/get-properties', getProperties);

// ✅ Route to add property
router.post('/add-property', addProperty);

// 📌 Route to get a property
router.get('/get-property/:id', getProperty);

// 📌 Route to update property
router.put('/update-property/:id', updateProperty);

// 📌 Route to delete property
router.delete('/delete-property/:id', deleteProperty);


export default router;