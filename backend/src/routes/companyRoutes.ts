import express from 'express';
import { uploadCompanyLogoHandler } from '../controllers/companyController';
import { uploadCompanyLogo } from '../middlewares/upload';

const router = express.Router();

router.post('/upload-logo', uploadCompanyLogo, uploadCompanyLogoHandler);

export { router as companyRoutes };
