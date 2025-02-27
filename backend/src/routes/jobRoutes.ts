import express from 'express';
import { addJob, fetchJobs, modifyJob, removeJob, bulkUploadJobs,fetchJobsFromActiveUsers,exportJobsToExcel,
    fetchJobsGroupedByEmail
 } from '../controllers/jobController';
import { validateJob, validateJobUpdate } from '../middlewares/validateRequest';
import { uploadJobFile } from '../middlewares/upload'; // ✅ Import middleware

const router = express.Router();

router.post('/', validateJob, addJob); // ✅ Validate job creation
router.get('/', fetchJobs);
router.patch('/:id', validateJobUpdate, modifyJob); // ✅ Validate job updates
router.delete('/:id', removeJob);
router.post('/bulk-upload', uploadJobFile, bulkUploadJobs); // ✅ Upload & process CSV/Excel files
router.get('/active-users-jobs', fetchJobsFromActiveUsers); // ✅ Get jobs from users with 10+ jobs
router.get('/grouped-by-email', fetchJobsGroupedByEmail); // ✅ New API endpoint
router.get('/export-excel', exportJobsToExcel); // ✅ Export jobs as Excel



export { router as jobRoutes };
