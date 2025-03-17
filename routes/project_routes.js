import express from 'express';
import {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    getSimilarProjects,
    getCityProjectCounts
} from '../controllers/project_controller.js';

const router = express.Router();

// ✅ Public Routes
router.get('/projects', getProjects);

router.get('/similar-projects', getSimilarProjects);

router.get('/city-project-counts', getCityProjectCounts);


router.get('/projects/:id', getProjectById);

// ✅ Protected Routes (Only authenticated users can create, update, and delete)
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

export default router;