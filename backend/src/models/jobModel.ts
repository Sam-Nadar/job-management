import { pool } from '../config/db';

export interface Job {
    id?: string;
    title: string;
    description: string;
    salary: number;
    location: string;
    category: string;
    postedById: string;
}

/**
 * ✅ Create a new job
 */
export const createJob = async (jobData: Job): Promise<Job> => {
    const query = `
        INSERT INTO jobs (title, description, salary, location, category, posted_by_id) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [jobData.title, jobData.description, jobData.salary, jobData.location, jobData.category, jobData.postedById];

    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * ✅ Fetch jobs with pagination & filtering
 */
export const getJobs = async (
    limit: number,
    offset: number,
    filters: { category?: string; location?: string }
): Promise<Job[]> => {
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const values: any[] = [];

    if (filters.category) {
        query += ' AND category = $1';
        values.push(filters.category);
    }
    if (filters.location) {
        query += ` AND location = $${values.length + 1}`;
        values.push(filters.location);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
};

/**
 * ✅ Update job details
 */
export const updateJob = async (id: string, jobData: Partial<Job>): Promise<Job | null> => {
    const fields = Object.keys(jobData).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = [...Object.values(jobData), id];

    if (fields.length === 0) return null; // Nothing to update

    const query = `UPDATE jobs SET ${fields} WHERE id = $${values.length} RETURNING *;`;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

/**
 * ✅ Delete a job
 */
export const deleteJob = async (id: string): Promise<Job | null> => {
    const query = `DELETE FROM jobs WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * ✅ Insert jobs in bulk while handling errors
 */
export const insertJobsBulk = async (jobs: Job[]): Promise<{ inserted: Job[]; errors: { job: Job; error: string }[] }> => {
    const inserted: Job[] = [];
    const errors: { job: Job; error: string }[] = [];

    for (const job of jobs) {
        try {
            const result = await createJob(job);
            inserted.push(result);
        } catch (error) {
            let errorMessage = 'Unknown error occurred';

            // ✅ Check if error is an instance of Error
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            // ✅ Handle database-specific errors
            if (typeof error === 'object' && error !== null && 'code' in error) {
                errorMessage = `Database Error: ${(error as any).code}`;
            }

            errors.push({ job, error: errorMessage });
        }
    }

    return { inserted, errors };
};



/**
 * ✅ Fetch unique jobs from users who have posted 10+ jobs
 */
export const getJobsFromActiveUsers = async (): Promise<Job[]> => {
    const query = `
        SELECT DISTINCT j.*
        FROM jobs j
        JOIN users u ON j.posted_by_id = u.id
        WHERE u.id IN (
            SELECT posted_by_id
            FROM jobs
            GROUP BY posted_by_id
            HAVING COUNT(*) >= 10
        );
    `;

    const result = await pool.query(query);
    return result.rows;
};

export const getJobsGroupedByEmail = async (email?: string): Promise<{ email: string; jobs: Job[] }[]> => {
    let query = `
        SELECT u.email, json_agg(j.*) AS jobs
        FROM jobs j
        JOIN users u ON j.posted_by_id = u.id
    `;
    
    const values: any[] = [];

    if (email) {
        query += ` WHERE u.email = $1`;
        values.push(email);
    }

    query += ` GROUP BY u.email;`;

    const result = await pool.query(query, values);
    return result.rows;
};
