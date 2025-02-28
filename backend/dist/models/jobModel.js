"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllJobs = exports.getJobsGroupedByEmail = exports.getJobsFromActiveUsers = exports.insertJobsBulk = exports.deleteJob = exports.getJobById = exports.updateJob = exports.getJobs = exports.createJob = void 0;
const db_1 = require("../config/db");
/**
 * ✅ Create a new job
 */
const createJob = (jobData) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
        INSERT INTO jobs (title, description, salary, location, category, posted_by_id,posted_by_email) 
        VALUES ($1, $2, $3, $4, $5, $6,$7) RETURNING *;
    `;
    const values = [jobData.title, jobData.description, jobData.salary, jobData.location, jobData.category, jobData.posted_by_id, jobData.posted_by_email];
    const result = yield db_1.pool.query(query, values);
    return result.rows[0];
});
exports.createJob = createJob;
/**
 * ✅ Fetch jobs with pagination & filtering
 */
const getJobs = (limit, offset, filters) => __awaiter(void 0, void 0, void 0, function* () {
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const values = [];
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
    const result = yield db_1.pool.query(query, values);
    return result.rows;
});
exports.getJobs = getJobs;
/**
 * ✅ Update job details
 */
const updateJob = (id, jobData, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!id.match(/^[0-9a-fA-F-]{36}$/)) {
        throw new Error('Invalid UUID format');
    }
    const fields = Object.keys(jobData).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = [...Object.values(jobData), id, userId];
    if (fields.length === 0)
        return null;
    // ✅ Only update if the job belongs to the user
    const query = `
        UPDATE jobs 
        SET ${fields}, updated_at = NOW() 
        WHERE id = $${values.length - 1} AND posted_by_id = $${values.length}
        RETURNING *;
    `;
    const result = yield db_1.pool.query(query, values);
    return result.rows[0] || null;
});
exports.updateJob = updateJob;
/**
 * ✅ Fetch a job by ID (To verify ownership before deletion)
 */
const getJobById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `SELECT * FROM jobs WHERE id = $1;`;
    const result = yield db_1.pool.query(query, [id]);
    return result.rows.length ? result.rows[0] : null;
});
exports.getJobById = getJobById;
/**
 * ✅ Delete a job (Ensures only the job owner can delete)
 */
const deleteJob = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `DELETE FROM jobs WHERE id = $1;`;
    yield db_1.pool.query(query, [id]);
});
exports.deleteJob = deleteJob;
/**
 * ✅ Insert jobs in bulk while handling errors
 */
const insertJobsBulk = (jobs) => __awaiter(void 0, void 0, void 0, function* () {
    const inserted = [];
    const errors = [];
    for (const job of jobs) {
        try {
            const result = yield (0, exports.createJob)(job);
            inserted.push(result);
        }
        catch (error) {
            let errorMessage = 'Unknown error occurred';
            // ✅ Check if error is an instance of Error
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            // ✅ Handle database-specific errors
            if (typeof error === 'object' && error !== null && 'code' in error) {
                errorMessage = `Database Error: ${error.code}`;
            }
            errors.push({ job, error: errorMessage });
        }
    }
    return { inserted, errors };
});
exports.insertJobsBulk = insertJobsBulk;
/**
 * ✅ Fetch unique jobs from users who have posted 10+ jobs
 */
const getJobsFromActiveUsers = (filters) => __awaiter(void 0, void 0, void 0, function* () {
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
    const values = [];
    let filterConditions = [];
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
    }
    else {
        console.log("⚠️ No filters provided, fetching ALL jobs"); // ✅ Debugging
    }
    console.log("Executing SQL Query:", query, "Values:", values); // ✅ Debugging
    const result = yield db_1.pool.query(query, values);
    return result.rows;
});
exports.getJobsFromActiveUsers = getJobsFromActiveUsers;
const getJobsGroupedByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    let query = `
        SELECT u.email, json_agg(j.*) AS jobs
        FROM jobs j
        JOIN users u ON j.posted_by_id = u.id
    `;
    const values = [];
    if (email) {
        query += ` WHERE u.email = $1`;
        values.push(email);
    }
    query += ` GROUP BY u.email;`;
    const result = yield db_1.pool.query(query, values);
    return result.rows;
});
exports.getJobsGroupedByEmail = getJobsGroupedByEmail;
const getAllJobs = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    let query = `
        SELECT DISTINCT j.*
        FROM jobs j
        JOIN users u ON j.posted_by_id = u.id
    `;
    const values = [];
    let filterConditions = [];
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
    const result = yield db_1.pool.query(query, values);
    return result.rows;
});
exports.getAllJobs = getAllJobs;
