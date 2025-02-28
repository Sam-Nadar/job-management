import { Request, Response, NextFunction } from 'express';
import { createUser, deleteUser } from '../models/userModel';

/**
 * ✅ Create a new user
 */
export const addUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email,password } = req.body;
        if (!email) {
            res.status(400).json({ success: false, message: 'Email is required' });
            return;
        }

        const user = await createUser(email,password);
        if (!user) {
            res.status(409).json({ success: false, message: 'User already exists' });
            return;
        }

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Delete a user
 */
export const removeUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await deleteUser(id);

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};
