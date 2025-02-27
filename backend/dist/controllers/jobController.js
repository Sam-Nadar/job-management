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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJobsGroupedByEmail = exports.exportJobsToExcel = exports.fetchJobsFromActiveUsers = exports.bulkUploadJobs = exports.removeJob = exports.modifyJob = exports.fetchJobs = exports.addJob = void 0;
const jobModel_1 = require("../models/jobModel");
const validateRequest_1 = require("../middlewares/validateRequest");
const jobModel_2 = require("../models/jobModel");
const jobModel_3 = require("../models/jobModel");
const excelExporter_1 = require("../utils/excelExporter");
const csvParser_1 = require("../utils/csvParser");
const excelParser_1 = require("../utils/excelParser");
const fs_1 = __importDefault(require("fs"));
/**
 * ✅ Create a new job
 */
const addJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = validateRequest_1.jobSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }
        const job = yield (0, jobModel_1.createJob)(req.body);
        res.status(201).json({ success: true, data: job });
    }
    catch (error) {
        next(error);
    }
});
exports.addJob = addJob;
/**
 * ✅ Fetch jobs with pagination & filtering
 */
const fetchJobs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const filters = {
        category: req.query.category,
        location: req.query.location,
    };
    try {
        const jobs = yield (0, jobModel_1.getJobs)(limit, offset, filters);
        res.status(200).json({ success: true, data: jobs });
    }
    catch (error) {
        next(error);
    }
});
exports.fetchJobs = fetchJobs;
/**
 * ✅ Update job details
 */
const modifyJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = validateRequest_1.updateJobSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }
        const job = yield (0, jobModel_1.updateJob)(req.params.id, req.body);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }
        res.status(200).json({ success: true, data: job });
    }
    catch (error) {
        next(error);
    }
});
exports.modifyJob = modifyJob;
/**
 * ✅ Delete a job
 */
const removeJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield (0, jobModel_1.deleteJob)(req.params.id);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Job deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.removeJob = removeJob;
/**
 *  Handle job file upload (CSV/Excel)
 */
const bulkUploadJobs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded' });
        return;
    }
    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    try {
        let jobs = [];
        if (fileType.includes('csv')) {
            jobs = yield (0, csvParser_1.parseCSV)(filePath);
        }
        else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
            jobs = yield (0, excelParser_1.parseExcel)(filePath);
        }
        else {
            res.status(400).json({ success: false, message: 'Invalid file type' });
            return;
        }
        fs_1.default.unlinkSync(filePath); // ✅ Delete file after processing
        // ✅ Validate job data before inserting
        const validJobs = [];
        const errors = [];
        for (const job of jobs) {
            const { error } = validateRequest_1.jobSchema.validate(job);
            if (error) {
                errors.push({ job, error: error.details[0].message });
                continue;
            }
            validJobs.push(job);
        }
        if (validJobs.length > 0) {
            yield Promise.all(validJobs.map(jobModel_1.createJob)); // ✅ Bulk insert valid jobs
        }
        res.status(200).json({
            success: true,
            message: `${validJobs.length} jobs inserted successfully`,
            errors
        });
    }
    catch (error) {
        fs_1.default.unlinkSync(filePath); // ✅ Delete file even if there's an error
        next(error);
    }
});
exports.bulkUploadJobs = bulkUploadJobs;
/**
 * ✅ Get jobs from users who have posted 10+ jobs
 */
const fetchJobsFromActiveUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobs = yield (0, jobModel_2.getJobsFromActiveUsers)();
        res.status(200).json({ success: true, data: jobs });
    }
    catch (error) {
        next(error);
    }
});
exports.fetchJobsFromActiveUsers = fetchJobsFromActiveUsers;
/**
 * ✅ Export jobs from users with 10+ jobs as Excel
 */
const exportJobsToExcel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch jobs from users who posted 10+ jobs
        const jobs = yield (0, jobModel_2.getJobsFromActiveUsers)();
        if (jobs.length === 0) {
            res.status(404).json({ success: false, message: 'No jobs found for active users.' });
            return;
        }
        // Generate Excel file
        const filePath = yield (0, excelExporter_1.generateExcelFile)(jobs);
        // Send the file as a downloadable response
        res.download(filePath, 'jobs.xlsx', (err) => {
            if (err) {
                next(err);
            }
            // Delete file after sending
            fs_1.default.unlinkSync(filePath);
        });
    }
    catch (error) {
        next(error);
    }
});
exports.exportJobsToExcel = exportJobsToExcel;
/**
 * ✅ Get jobs grouped by user's email
 */
const fetchJobsGroupedByEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.query.email; // ✅ Get email from query params
        const groupedJobs = yield (0, jobModel_3.getJobsGroupedByEmail)(email);
        if (email && groupedJobs.length === 0) {
            res.status(404).json({ success: false, message: `No jobs found for email: ${email}` });
            return;
        }
        res.status(200).json({ success: true, data: groupedJobs });
    }
    catch (error) {
        next(error);
    }
});
exports.fetchJobsGroupedByEmail = fetchJobsGroupedByEmail;
