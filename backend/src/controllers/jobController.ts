import { Request, Response, NextFunction } from 'express';
import { createJob, getJobs, updateJob, deleteJob } from '../models/jobModel';
import { jobSchema, updateJobSchema } from '../middlewares/validateRequest';
import { getJobsFromActiveUsers } from '../models/jobModel';
import { getJobsGroupedByEmail } from '../models/jobModel';
import { generateExcelFile } from '../utils/excelExporter';
import { parseCSV } from '../utils/csvParser';
import { parseExcel } from '../utils/excelParser';
import fs from 'fs';

/**
 * ✅ Create a new job
 */
export const addJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { error } = jobSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const job = await createJob(req.body);
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
    };

    try {
        const jobs = await getJobs(limit, offset, filters);
        res.status(200).json({ success: true, data: jobs });
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Update job details
 */
export const modifyJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { error } = updateJobSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }

        const job = await updateJob(req.params.id, req.body);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }

        res.status(200).json({ success: true, data: job });
    } catch (error) {
        next(error);
    }
};

/**
 * ✅ Delete a job
 */
export const removeJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const job = await deleteJob(req.params.id);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }

        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    } catch (error) {
        next(error);
    }
};






/**
 *  Handle job file upload (CSV/Excel)
 */
export const bulkUploadJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

        fs.unlinkSync(filePath); // ✅ Delete file after processing

        // ✅ Validate job data before inserting
        const validJobs = [];
        const errors = [];

        for (const job of jobs) {
            const { error } = jobSchema.validate(job);
            if (error) {
                errors.push({ job, error: error.details[0].message });
                continue;
            }
            validJobs.push(job);
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
        fs.unlinkSync(filePath); // ✅ Delete file even if there's an error
        next(error);
    }
};


/**
 * ✅ Get jobs from users who have posted 10+ jobs
 */
export const fetchJobsFromActiveUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const jobs = await getJobsFromActiveUsers();
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
        // Fetch jobs from users who posted 10+ jobs
        const jobs = await getJobsFromActiveUsers();

        if (jobs.length === 0) {
            res.status(404).json({ success: false, message: 'No jobs found for active users.' });
            return;
        }

        // Generate Excel file
        const filePath = await generateExcelFile(jobs);

        // Send the file as a downloadable response
        res.download(filePath, 'jobs.xlsx', (err) => {
            if (err) {
                next(err);
            }
            // Delete file after sending
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
        const email = req.query.email as string | undefined; // ✅ Get email from query params
        const groupedJobs = await getJobsGroupedByEmail(email);
        
        if (email && groupedJobs.length === 0) {
            res.status(404).json({ success: false, message: `No jobs found for email: ${email}` });
            return;
        }

        res.status(200).json({ success: true, data: groupedJobs });
    } catch (error) {
        next(error);
    }
};

