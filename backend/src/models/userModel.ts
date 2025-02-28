import { pool } from '../config/db';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export interface User {
    id?: string;
    email: string;
    password: string;
}

/**
 * ✅ Register a new user with hashed password
 */
export const createUser = async (email: string, password: string): Promise<User | null> => {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const query = `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *;`;
    const result = await pool.query(query, [email, hashedPassword]);

    return result.rows.length ? result.rows[0] : null;
};

/**
 * ✅ Find a user by email
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
    const query = `SELECT * FROM users WHERE email = $1;`;
    const result = await pool.query(query, [email]);

    return result.rows.length ? result.rows[0] : null;
};

/**
 * ✅ Validate user login
 */
export const validateUser = async (email: string, password: string): Promise<User | null> => {
    const user = await findUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
};

/**
 * ✅ Delete a user and their associated jobs
 */
export const deleteUser = async (id: string): Promise<User | null> => {
    const query = `DELETE FROM users WHERE id = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};
