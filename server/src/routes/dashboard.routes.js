import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import AuthToken from '../middlewares/AuthToken.middleware.js';

const router = Router();

router.get('/', AuthToken, getDashboardStats);

export default router;
