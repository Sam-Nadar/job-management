import { Request, Response, NextFunction } from 'express';
import { createJob, getJobs, updateJob, deleteJob, getAllJobs } from '../models/jobModel';
import { jobSchema, updateJobSchema } from '../middlewares/validateRequest';
import { getJobById } from '../models/jobModel'; // ✅ Fetch job before deletion

import { getJobsFromActiveUsers } from '../models/jobModel';
import { getJobsGroupedByEmail } from '../models/jobModel';
import { generateExcelFile } from '../utils/excelExporter';
import { parseCSV } from '../utils/csvParser';
import { parseExcel } from '../utils/excelParser';
import fs from 'fs';

interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

/**
 * ✅ Add a new job (Requires authentication)
 */
export const addJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
            return;
        }

        // ✅ Inject posted_by_id & posted_by_email from JWT
        const jobData = {
            ...req.body,
            posted_by_id: req.user.id,
            posted_by_email: req.user.email
        };

        const job = await createJob(jobData);
        res.status(201).json({ success: true, data: job });
    } catch (error) {
        next(error);
    }
};
/**
 * ✅ Fetch jobs with pagination & filtering
 */

export const fetchJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const filters = {
        category: req.query.category as string | undefined,
        location: req.query.location as string | undefined,
        email: req.query.email as string | undefined
    };

    try {
        const jobs = await getJobs(limit, offset, filters);
        const filteredJobs = jobs.map(({ posted_by_id, ...rest }) => rest); // ✅ Remove posted_by_id
        res.status(200).json({ success: true, data: filteredJobs });
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Update job details
 */


export const modifyJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log("Received Request:", req.body);
        console.log("User from JWT:", req.user); // ✅ Debugging step

        if (!req.user) {
            console.error("⚠️ Unauthorized: No user attached to request");
            res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
            return;
        }

        const { error } = updateJobSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const job = await updateJob(req.params.id, req.body, req.user.id);
        if (!job) {
            res.status(403).json({ success: false, message: "You are not authorized to update this job." });
            return;
        }

        const { posted_by_id, ...filteredJob } = job;
        res.status(200).json({ success: true, data: filteredJob });
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Delete a job
 */
export const removeJob = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
            return;
        }

        const job = await getJobById(req.params.id);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }

        // ✅ Ensure only the job owner can delete the job
        if (job.posted_by_id !== req.user.id) {
            res.status(403).json({ success: false, message: 'You are not authorized to delete this job.' });
            return;
        }

        await deleteJob(req.params.id);
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        next(error);
    }
};






/**
 *  Handle job file upload (CSV/Excel)
 */
export const bulkUploadJobs = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    try {
        let jobs: any[] = [];

        if (fileType.includes('csv')) {
            jobs = await parseCSV(filePath);
        } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
            jobs = await parseExcel(filePath);
        } else {
            res.status(400).json({ success: false, message: 'Invalid file type' });
            return;
        }

        fs.unlinkSync(filePath);

        // ✅ Assign the logged-in user's ID and email to each job
        const validJobs = [];
        const errors = [];

        for (const job of jobs) {
            const jobWithUserData = {
                ...job,
                posted_by_id: req.user!.id, // ✅ Ensure `posted_by_id` is assigned
                posted_by_email: req.user!.email
            };

            const { error } = jobSchema.validate(jobWithUserData);
            if (error) {
                errors.push({ job, error: error.details[0].message });
                continue;
            }

            validJobs.push(jobWithUserData);
        }

        if (validJobs.length > 0) {
            await Promise.all(validJobs.map(createJob)); // ✅ Bulk insert valid jobs
        }

        res.status(200).json({
            success: true,
            message: `${validJobs.length} jobs inserted successfully`,
            errors
        });

    } catch (error) {
        fs.unlinkSync(filePath);
        next(error);
    }
};



/**
 * ✅ Get jobs from users who have posted 10+ jobs
 */
export const fetchJobsFromActiveUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filters: { email?: string; location?: string; category?: string } = {};

        if (req.query.email) filters.email = req.query.email as string;
        if (req.query.location) filters.location = req.query.location as string;
        if (req.query.category) filters.category = req.query.category as string;

        // ✅ Fetch jobs with filters (or all jobs if no filters provided)
        const jobs = await getJobsFromActiveUsers(filters);

        if (jobs.length === 0) {
            res.status(404).json({ success: false, message: 'No jobs found matching filters.' });
            return;
        }

        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        next(error);
    }
};


/**
 * ✅ Export jobs from users with 10+ jobs as Excel
 */
export const exportJobsToExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log("Raw Query Parameters:", req.query); // ✅ Check received params

        const filters: { email?: string; location?: string; category?: string } = {};

        if (req.query.email) filters.email = req.query.email as string;
        if (req.query.location) filters.location = req.query.location as string;
        if (req.query.category) filters.category = req.query.category as string;

        console.log("Extracted Filters:", filters); // ✅ Check extracted filters

        // ✅ Check if filters are empty
        if (Object.keys(filters).length === 0) {
            console.log("⚠️ No filters provided, fetching ALL jobs");
        }

        // ✅ Fetch jobs with or without filters
        const jobs = await getAllJobs(filters);

        console.log("Jobs Found:", jobs.length); // ✅ Check if jobs are found

        if (jobs.length === 0) {
            res.status(404).json({ success: false, message: 'No jobs found matching filters.' });
            return;
        }

        // ✅ Generate Excel file
        const filePath = await generateExcelFile(jobs);

        res.download(filePath, 'filtered-jobs.xlsx', (err) => {
            if (err) next(err);
            fs.unlinkSync(filePath);
        });

    } catch (error) {
        next(error);
    }
};


/**
 * ✅ Get jobs grouped by user's email
 */
export const fetchJobsGroupedByEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const email = req.query.email as string | undefined;
        const groupedJobs = await getJobsGroupedByEmail(email);

        if (email && groupedJobs.length === 0) {
            res.status(404).json({ success: false, message: `No jobs found for email: ${email}` });
            return;
        }

        // ✅ Remove posted_by_id from each job in the response
        const filteredGroupedJobs = groupedJobs.map(group => ({
            email: group.email,
            jobs: group.jobs.map(({ posted_by_id, ...rest }) => rest)
        }));

        res.status(200).json({ success: true, data: filteredGroupedJobs });
    } catch (error) {
        next(error);
    }
};


