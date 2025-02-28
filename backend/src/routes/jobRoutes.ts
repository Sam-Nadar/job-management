import express from 'express';
import { addJob, fetchJobs, modifyJob, removeJob, bulkUploadJobs,fetchJobsFromActiveUsers,exportJobsToExcel,
    fetchJobsGroupedByEmail
 } from '../controllers/jobController';
import { validateJob, validateJobUpdate } from '../middlewares/validateRequest';
import { uploadJobFile } from '../middlewares/upload'; // ✅ Import middleware
import { authenticateUser } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/',authenticateUser, validateJob, addJob); // ✅ Validate job creation
router.get('/', fetchJobs);
router.patch('/:id', authenticateUser,validateJobUpdate, modifyJob); // ✅ Validate job updates
router.delete('/:id', authenticateUser,removeJob);
router.post('/bulk-upload', authenticateUser,uploadJobFile, bulkUploadJobs); // ✅ Upload & process CSV/Excel files
router.get('/active-users-jobs', fetchJobsFromActiveUsers); // ✅ Get jobs from users with 10+ jobs
router.get('/grouped-by-email', fetchJobsGroupedByEmail); // ✅ New API endpoint
router.get('/export-excel',authenticateUser, exportJobsToExcel); // ✅ Export jobs as Excel



export { router as jobRoutes };
