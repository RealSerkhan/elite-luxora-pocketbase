import express from 'express';
import authenticateUser from '../middlewares/auth_middleware.js';
import {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getSimilarProjects
} from '../controllers/project_controller.js';

const router = express.Router();

// ✅ Public Routes
router.get('/projects', getProjects);

router.get('/similar-projects', getSimilarProjects);

router.get('/projects/:id', getProjectById);

// ✅ Protected Routes (Only authenticated users can create, update, and delete)
router.post('/projects', createProject);
router.put('/projects/:id', authenticateUser, updateProject);
router.delete('/projects/:id', authenticateUser, deleteProject);

export default router;