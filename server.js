import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth_routes.js';
import propertyRoutes from './routes/property_routes.js';
import userRoutes from './routes/user_routes.js';
import projectRoutes from './routes/project_routes.js';
import contactRoutes from './routes/contact_routes.js';
import aboutUsRoutes from './routes/about_us_routes.js';




dotenv.config();

const app = express();
app.use(express.json());



/**
 * 📌 PropertyRoutes
 */
app.use('/api/property',propertyRoutes)


/**
 * 📌 Project Routes
 */
app.use('/api/project', projectRoutes);



// ✅ Auth Routes
app.use('/api/auth', authRoutes);


// ✅ User Routes
app.use('/api/user', userRoutes);


// ✅ Contact Routes
app.use('/api', contactRoutes);


// ✅ About Us Routes
app.use('/api', aboutUsRoutes);




app.listen(3000, () => {
    console.log('API server running on http://0.0.0.1:3000');
});