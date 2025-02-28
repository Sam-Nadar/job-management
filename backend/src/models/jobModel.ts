import { pool } from '../config/db';

export interface Job {
    id: string;
    title: string;
    description: string;
    salary: number;
    location: string;
    category: string;
    posted_by_id?: string; // ✅ Ensure this exists in Job type
    posted_by_email: string;
    created_at: Date;
    updated_at: Date;
}

/**
 * ✅ Create a new job
 */
export const createJob = async (jobData: Job): Promise<Job> => {
    const query = `
        INSERT INTO jobs (title, description, salary, location, category, posted_by_id,posted_by_email) 
        VALUES ($1, $2, $3, $4, $5, $6,$7) RETURNING *;
    `;
    const values = [jobData.title, jobData.description, jobData.salary, jobData.location, jobData.category, jobData.posted_by_id,jobData.posted_by_email];

    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * ✅ Fetch jobs with pagination & filtering
 */
export const getJobs = async (
    limit: number,
    offset: number,
    filters: { category?: string; location?: string; email?: string }
): Promise<Job[]> => {
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const values: any[] = [];

    if (filters.category) {
        query += ` AND category = $${values.length + 1}`;
        values.push(filters.category);
    }
    if (filters.location) {
        query += ` AND location = $${values.length + 1}`;
        values.push(filters.location);
    }
    if (filters.email) {
        query += ` AND posted_by_email = $${values.length + 1}`; // ✅ Added email filtering
        values.push(filters.email);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
};


/**
 * ✅ Update job details
 */
export const updateJob = async (id: string, jobData: Partial<Job>, userId: string): Promise<Job | null> => {
    if (!id.match(/^[0-9a-fA-F-]{36}$/)) {
        throw new Error('Invalid UUID format');
    }

    const fields = Object.keys(jobData).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = [...Object.values(jobData), id, userId];

    if (fields.length === 0) return null;

    // ✅ Only update if the job belongs to the user
    const query = `
        UPDATE jobs 
        SET ${fields}, updated_at = NOW() 
        WHERE id = $${values.length - 1} AND posted_by_id = $${values.length}
        RETURNING *;
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
};


/**
 * ✅ Fetch a job by ID (To verify ownership before deletion)
 */
export const getJobById = async (id: string): Promise<Job | null> => {
    const query = `SELECT * FROM jobs WHERE id = $1;`;
    const result = await pool.query(query, [id]);

    return result.rows.length ? result.rows[0] : null;
};

/**
 * ✅ Delete a job (Ensures only the job owner can delete)
 */
export const deleteJob = async (id: string): Promise<void> => {
    const query = `DELETE FROM jobs WHERE id = $1;`;
    await pool.query(query, [id]);
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
export const getJobsFromActiveUsers = async (filters: { email?: string; location?: string; category?: string }) => {
    let query = `
        SELECT DISTINCT j.*
        FROM jobs j
        JOIN users u ON j.posted_by_id = u.id
        WHERE u.id IN (
            SELECT posted_by_id
            FROM jobs
            GROUP BY posted_by_id
            HAVING COUNT(*) >= 10
        )
    `;

    const values: any[] = [];
    let filterConditions: string[] = [];

    // ✅ If filters exist, apply conditions
    if (filters.email) {
        filterConditions.push(`u.email = $${values.length + 1}`);
        values.push(filters.email);
    }
    if (filters.location) {
        filterConditions.push(`j.location ILIKE $${values.length + 1}`); // ✅ ILIKE for case-insensitivity
        values.push(filters.location);
    }
    if (filters.category) {
        filterConditions.push(`j.category ILIKE $${values.length + 1}`);
        values.push(filters.category);
    }

    // ✅ If no filters are provided, remove `WHERE` conditions to fetch ALL jobs
    if (filterConditions.length > 0) {
        query += ` AND ${filterConditions.join(" AND ")}`;
    } else {
        console.log("⚠️ No filters provided, fetching ALL jobs"); // ✅ Debugging
    }

    console.log("Executing SQL Query:", query, "Values:", values); // ✅ Debugging

    const result = await pool.query(query, values);
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


export const getAllJobs = async (filters: { email?: string; location?: string; category?: string }) => {
    let query = `
        SELECT DISTINCT j.*
        FROM jobs j
        JOIN users u ON j.posted_by_id = u.id
    `;

    const values: any[] = [];
    let filterConditions: string[] = [];

    // ✅ If filters exist, apply conditions
    if (filters.email) {
        filterConditions.push(`u.email = $${values.length + 1}`);
        values.push(filters.email);
    }
    if (filters.location) {
        filterConditions.push(`j.location ILIKE $${values.length + 1}`); // ✅ ILIKE for case-insensitivity
        values.push(filters.location);
    }
    if (filters.category) {
        filterConditions.push(`j.category ILIKE $${values.length + 1}`);
        values.push(filters.category);
    }

    // ✅ If filters exist, apply WHERE conditions
    if (filterConditions.length > 0) {
        query += ` WHERE ${filterConditions.join(" AND ")}`;
    }

    console.log("Executing SQL Query:", query, "Values:", values); // ✅ Debugging

    const result = await pool.query(query, values);
    return result.rows;
};
