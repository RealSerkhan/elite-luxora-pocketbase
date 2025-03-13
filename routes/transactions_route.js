import express from 'express';
import { createTransaction, getTransactions, getTransactionsById } from '../controllers/transactions_controller.js';



const router = express.Router();

// ✅ Route to get transactions
router.get('/get-transactions', getTransactions);

// ✅ Route to add transaction
router.post('/create-transaction', createTransaction);

// ✅ Route to get transaction by ID
router.get('/get-transaction-by-id/:id', getTransactionsById);


export default router;