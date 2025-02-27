import express from 'express';
import { addUser, removeUser } from '../controllers/userController';

const router = express.Router();

router.post('/', addUser); // ✅ Create user
router.delete('/:id', removeUser); // ✅ Delete user

export { router as userRoutes };
