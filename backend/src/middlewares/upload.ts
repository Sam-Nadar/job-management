import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

// Ensure upload directories exist
fs.ensureDirSync('uploads/images');
fs.ensureDirSync('uploads/files');

// Define storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.includes('image')) {
            cb(null, 'uploads/images/');
        } else if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel') || file.mimetype.includes('csv')) {
            cb(null, 'uploads/files/');
        } else {
            cb(new Error('Invalid file type'), '');
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});

// ✅ Fix file filter to correctly detect `.xlsx` MIME types
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedImages = /jpeg|PNG|jpg|png/;
    const allowedFiles = /csv|xlsx|xls/;
    const extName = allowedFiles.test(path.extname(file.originalname).toLowerCase()) || 
                    allowedImages.test(path.extname(file.originalname).toLowerCase());
    
    const mimeType = file.mimetype.includes('spreadsheet') || 
                     file.mimetype.includes('excel') || 
                     file.mimetype.includes('csv') ||
                     allowedImages.test(file.mimetype);

    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new Error('Only CSV, Excel, JPEG, JPG, and PNG files are allowed'));
    }
};

// ✅ Define separate upload handlers
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ✅ Middleware for handling company logo uploads
export const uploadCompanyLogo = upload.single('logo');

// ✅ Middleware for handling CSV/Excel file uploads
export const uploadJobFile = upload.single('file');
