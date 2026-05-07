import { Router } from 'express';
import { updateCookies } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/cookies', authenticate, updateCookies);

export default router;
