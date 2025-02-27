import { pool } from '../config/db';

export interface User {
    id?: string;
    email: string;
}

/**
 * ✅ Create a new user
 */
export const createUser = async (email: string): Promise<User> => {
    const query = `INSERT INTO users (email) VALUES ($1) ON CONFLICT(email) DO NOTHING RETURNING *;`;
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

/**
 * ✅ Delete a user and their associated jobs
 */
export const deleteUser = async (id: string): Promise<User | null> => {
    const query = `DELETE FROM users WHERE id = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};
