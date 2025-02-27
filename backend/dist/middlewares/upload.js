"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadJobFile = exports.uploadCompanyLogo = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
// Ensure upload directories exist
fs_extra_1.default.ensureDirSync('uploads/images');
fs_extra_1.default.ensureDirSync('uploads/files');
// Define storage configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype.includes('image')) {
            cb(null, 'uploads/images/');
        }
        else if (file.mimetype.includes('spreadsheet') || file.mimetype.includes('excel') || file.mimetype.includes('csv')) {
            cb(null, 'uploads/files/');
        }
        else {
            cb(new Error('Invalid file type'), '');
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`);
    }
});
// ✅ Fix file filter to correctly detect `.xlsx` MIME types
const fileFilter = (req, file, cb) => {
    const allowedImages = /jpeg|PNG|jpg|png/;
    const allowedFiles = /csv|xlsx|xls/;
    const extName = allowedFiles.test(path_1.default.extname(file.originalname).toLowerCase()) ||
        allowedImages.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimeType = file.mimetype.includes('spreadsheet') ||
        file.mimetype.includes('excel') ||
        file.mimetype.includes('csv') ||
        allowedImages.test(file.mimetype);
    if (extName && mimeType) {
        cb(null, true);
    }
    else {
        cb(new Error('Only CSV, Excel, JPEG, JPG, and PNG files are allowed'));
    }
};
// ✅ Define separate upload handlers
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
// ✅ Middleware for handling company logo uploads
exports.uploadCompanyLogo = exports.upload.single('logo');
// ✅ Middleware for handling CSV/Excel file uploads
exports.uploadJobFile = exports.upload.single('file');
