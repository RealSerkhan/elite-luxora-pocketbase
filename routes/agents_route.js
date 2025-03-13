import express from 'express';
import {getAgentById,getAgents } from '../controllers/agent_controller.js';



const router = express.Router();

// ✅ Route to get transactions
router.get('/get-agents', getAgents);



// ✅ Route to get transaction by ID
router.get('/get-agent-by-id/:id', getAgentById);


export default router;