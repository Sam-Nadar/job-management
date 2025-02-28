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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchJobsGroupedByEmail = exports.exportJobsToExcel = exports.fetchJobsFromActiveUsers = exports.bulkUploadJobs = exports.removeJob = exports.modifyJob = exports.fetchJobs = exports.addJob = void 0;
const jobModel_1 = require("../models/jobModel");
const validateRequest_1 = require("../middlewares/validateRequest");
const jobModel_2 = require("../models/jobModel"); // ✅ Fetch job before deletion
const jobModel_3 = require("../models/jobModel");
const jobModel_4 = require("../models/jobModel");
const excelExporter_1 = require("../utils/excelExporter");
const csvParser_1 = require("../utils/csvParser");
const excelParser_1 = require("../utils/excelParser");
const fs_1 = __importDefault(require("fs"));
/**
 * ✅ Add a new job (Requires authentication)
 */
const addJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
            return;
        }
        // ✅ Inject posted_by_id & posted_by_email from JWT
        const jobData = Object.assign(Object.assign({}, req.body), { posted_by_id: req.user.id, posted_by_email: req.user.email });
        const job = yield (0, jobModel_1.createJob)(jobData);
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
        email: req.query.email
    };
    try {
        const jobs = yield (0, jobModel_1.getJobs)(limit, offset, filters);
        const filteredJobs = jobs.map((_a) => {
            var { posted_by_id } = _a, rest = __rest(_a, ["posted_by_id"]);
            return rest;
        }); // ✅ Remove posted_by_id
        res.status(200).json({ success: true, data: filteredJobs });
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
        console.log("Received Request:", req.body);
        console.log("User from JWT:", req.user); // ✅ Debugging step
        if (!req.user) {
            console.error("⚠️ Unauthorized: No user attached to request");
            res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
            return;
        }
        const { error } = validateRequest_1.updateJobSchema.validate(req.body);
        if (error) {
            res.status(400).json({ success: false, message: error.details[0].message });
            return;
        }
        const job = yield (0, jobModel_1.updateJob)(req.params.id, req.body, req.user.id);
        if (!job) {
            res.status(403).json({ success: false, message: "You are not authorized to update this job." });
            return;
        }
        const { posted_by_id } = job, filteredJob = __rest(job, ["posted_by_id"]);
        res.status(200).json({ success: true, data: filteredJob });
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
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
            return;
        }
        const job = yield (0, jobModel_2.getJobById)(req.params.id);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }
        // ✅ Ensure only the job owner can delete the job
        if (job.posted_by_id !== req.user.id) {
            res.status(403).json({ success: false, message: 'You are not authorized to delete this job.' });
            return;
        }
        yield (0, jobModel_1.deleteJob)(req.params.id);
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
        fs_1.default.unlinkSync(filePath);
        // ✅ Assign the logged-in user's ID and email to each job
        const validJobs = [];
        const errors = [];
        for (const job of jobs) {
            const jobWithUserData = Object.assign(Object.assign({}, job), { posted_by_id: req.user.id, posted_by_email: req.user.email });
            const { error } = validateRequest_1.jobSchema.validate(jobWithUserData);
            if (error) {
                errors.push({ job, error: error.details[0].message });
                continue;
            }
            validJobs.push(jobWithUserData);
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
        fs_1.default.unlinkSync(filePath);
        next(error);
    }
});
exports.bulkUploadJobs = bulkUploadJobs;
/**
 * ✅ Get jobs from users who have posted 10+ jobs
 */
const fetchJobsFromActiveUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filters = {};
        if (req.query.email)
            filters.email = req.query.email;
        if (req.query.location)
            filters.location = req.query.location;
        if (req.query.category)
            filters.category = req.query.category;
        // ✅ Fetch jobs with filters (or all jobs if no filters provided)
        const jobs = yield (0, jobModel_3.getJobsFromActiveUsers)(filters);
        if (jobs.length === 0) {
            res.status(404).json({ success: false, message: 'No jobs found matching filters.' });
            return;
        }
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
        console.log("Raw Query Parameters:", req.query); // ✅ Check received params
        const filters = {};
        if (req.query.email)
            filters.email = req.query.email;
        if (req.query.location)
            filters.location = req.query.location;
        if (req.query.category)
            filters.category = req.query.category;
        console.log("Extracted Filters:", filters); // ✅ Check extracted filters
        // ✅ Check if filters are empty
        if (Object.keys(filters).length === 0) {
            console.log("⚠️ No filters provided, fetching ALL jobs");
        }
        // ✅ Fetch jobs with or without filters
        const jobs = yield (0, jobModel_1.getAllJobs)(filters);
        console.log("Jobs Found:", jobs.length); // ✅ Check if jobs are found
        if (jobs.length === 0) {
            res.status(404).json({ success: false, message: 'No jobs found matching filters.' });
            return;
        }
        // ✅ Generate Excel file
        const filePath = yield (0, excelExporter_1.generateExcelFile)(jobs);
        res.download(filePath, 'filtered-jobs.xlsx', (err) => {
            if (err)
                next(err);
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
        const email = req.query.email;
        const groupedJobs = yield (0, jobModel_4.getJobsGroupedByEmail)(email);
        if (email && groupedJobs.length === 0) {
            res.status(404).json({ success: false, message: `No jobs found for email: ${email}` });
            return;
        }
        // ✅ Remove posted_by_id from each job in the response
        const filteredGroupedJobs = groupedJobs.map(group => ({
            email: group.email,
            jobs: group.jobs.map((_a) => {
                var { posted_by_id } = _a, rest = __rest(_a, ["posted_by_id"]);
                return rest;
            })
        }));
        res.status(200).json({ success: true, data: filteredGroupedJobs });
    }
    catch (error) {
        next(error);
    }
});
exports.fetchJobsGroupedByEmail = fetchJobsGroupedByEmail;
