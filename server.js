import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth_routes.js';
import propertyRoutes from './routes/property_routes.js';
import userRoutes from './routes/user_routes.js';
import projectRoutes from './routes/project_routes.js';
import contactRoutes from './routes/contact_routes.js';
import aboutUsRoutes from './routes/about_us_routes.js';
import transactionsRoutes from './routes/transactions_route.js';
import agentsRoute from './routes/agents_route.js';
import commentsRoutes from './routes/comment_routes.js';
import locationRoutes from './routes/location_routes.js';
import mortgageFaqs from './routes/mortgage_routes.js';
import developerRoutes from './routes/developer_routes.js';





import cors from 'cors';
import i18next from './config/i18n.js';
import middleware from 'i18next-http-middleware';




dotenv.config();

const app = express();
app.use(express.json());

// ✅ Enable CORS for Frontend Access
app.use(cors({
    origin: '*', // ✅ Allows all origins (for testing)// ['https://yourfrontend.com', 'https://another-frontend.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Add i18next Middleware
app.use(middleware.handle(i18next));


/**
 * 📌 PropertyRoutes
 */
app.use('/api/property', propertyRoutes)


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


// ✅ Transactions Routes
app.use('/api/transactions', transactionsRoutes);

// ✅ Agent Routes
app.use('/api/agents', agentsRoute);

// ✅ comment Routes
app.use('/api/comment', commentsRoutes);


// ✅ location Routes
app.use('/api/location', locationRoutes);

// ✅ mortgage Routes
app.use('/api/mortgage', mortgageFaqs);

// ✅ developer Routes
app.use('/api/developer', developerRoutes);




app.listen(3000, () => {
    console.log('API server running on http://0.0.0.1:3000');
});