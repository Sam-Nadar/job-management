import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';

const router = express.Router();

router.post('/register', registerUser); // ✅ Register route
router.post('/login', loginUser); // ✅ Login route

export { router as authRoutes };
