import { Request, Response, NextFunction } from 'express';
import { createUser, validateUser } from '../models/userModel';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

/**
 * ✅ Register a new user
 */
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }

        const user = await createUser(email, password);
        if (!user) {
            res.status(409).json({ success: false, message: 'User already exists' });
            return;
        }

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Login user and return JWT token
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }

        const user = await validateUser(email, password);
        if (!user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '72h' });

        res.status(200).json({ success: true, token });
    } catch (error) {
        next(error);
    }
};
