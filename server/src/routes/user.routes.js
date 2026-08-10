import { Router } from 'express';
import {
  login,
  logout,
  profile,
  refreshToken,
  register,
} from '../controllers/user.controller.js';
import AuthToken from '../middlewares/AuthToken.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', AuthToken, logout);
router.get('/profile', AuthToken, profile);
router.post('/refresh-token', refreshToken);

export default router;
