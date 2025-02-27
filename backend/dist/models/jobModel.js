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
exports.getJobsGroupedByEmail = exports.getJobsFromActiveUsers = exports.insertJobsBulk = exports.deleteJob = exports.updateJob = exports.getJobs = exports.createJob = void 0;
const db_1 = require("../config/db");
/**
 * ✅ Create a new job
 */
const createJob = (jobData) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `
        INSERT INTO jobs (title, description, salary, location, category, posted_by_id) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
    `;
    const values = [jobData.title, jobData.description, jobData.salary, jobData.location, jobData.category, jobData.postedById];
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
        query += ' AND category = $1';
        values.push(filters.category);
    }
    if (filters.location) {
        query += ` AND location = $${values.length + 1}`;
        values.push(filters.location);
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
const updateJob = (id, jobData) => __awaiter(void 0, void 0, void 0, function* () {
    const fields = Object.keys(jobData).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = [...Object.values(jobData), id];
    if (fields.length === 0)
        return null; // Nothing to update
    const query = `UPDATE jobs SET ${fields} WHERE id = $${values.length} RETURNING *;`;
    const result = yield db_1.pool.query(query, values);
    return result.rows[0] || null;
});
exports.updateJob = updateJob;
/**
 * ✅ Delete a job
 */
const deleteJob = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `DELETE FROM jobs WHERE id = $1 RETURNING *`;
    const result = yield db_1.pool.query(query, [id]);
    return result.rows[0] || null;
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
const getJobsFromActiveUsers = () => __awaiter(void 0, void 0, void 0, function* () {
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
    const result = yield db_1.pool.query(query);
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
