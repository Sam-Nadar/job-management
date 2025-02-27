"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRoutes = void 0;
const express_1 = __importDefault(require("express"));
const jobController_1 = require("../controllers/jobController");
const validateRequest_1 = require("../middlewares/validateRequest");
const upload_1 = require("../middlewares/upload"); // ✅ Import middleware
const router = express_1.default.Router();
exports.jobRoutes = router;
router.post('/', validateRequest_1.validateJob, jobController_1.addJob); // ✅ Validate job creation
router.get('/', jobController_1.fetchJobs);
router.patch('/:id', validateRequest_1.validateJobUpdate, jobController_1.modifyJob); // ✅ Validate job updates
router.delete('/:id', jobController_1.removeJob);
router.post('/bulk-upload', upload_1.uploadJobFile, jobController_1.bulkUploadJobs); // ✅ Upload & process CSV/Excel files
router.get('/active-users-jobs', jobController_1.fetchJobsFromActiveUsers); // ✅ Get jobs from users with 10+ jobs
router.get('/grouped-by-email', jobController_1.fetchJobsGroupedByEmail); // ✅ New API endpoint
router.get('/export-excel', jobController_1.exportJobsToExcel); // ✅ Export jobs as Excel
