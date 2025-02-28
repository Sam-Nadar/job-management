import { pool } from './db';

export const createTables = async (): Promise<void> => {
    const query = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL  -- ✅ Added password for authentication
    );

    CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        salary INT NOT NULL,
        location VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        posted_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        posted_by_email VARCHAR(255) NOT NULL  -- ✅ Added posted_by_email for easier querying
    );
    `;

    try {
        await pool.query(query);
        console.log('✅ Database tables created successfully');
    } catch (err) {
        console.error('❌ Error creating tables:', err);
    }
};
