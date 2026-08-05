import express from 'express';
import { loginController, registerController, topupController } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);
router.post('/topup', topupController);

export default router;
