import express from 'express';
import { adminUsersController } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', adminUsersController);

export default router;
