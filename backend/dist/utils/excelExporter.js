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
exports.generateExcelFile = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const path_1 = __importDefault(require("path"));
/**
 * ✅ Generate an Excel file for job listings
 */
const generateExcelFile = (jobs) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new exceljs_1.default.Workbook();
    const worksheet = workbook.addWorksheet('Jobs');
    // Define columns (Removed `postedById`, Added `posted_by_email`)
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Title', key: 'title', width: 20 },
        { header: 'Description', key: 'description', width: 30 },
        { header: 'Salary', key: 'salary', width: 15 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Posted By (Email)', key: 'posted_by_email', width: 30 },
        { header: 'Created At', key: 'created_at', width: 20 },
        { header: 'Updated At', key: 'updated_at', width: 20 },
    ];
    // Add job data rows (Ensuring correct field names)
    jobs.forEach(job => {
        worksheet.addRow({
            id: job.id,
            title: job.title,
            description: job.description,
            salary: job.salary,
            location: job.location,
            category: job.category,
            posted_by_email: job.posted_by_email,
            created_at: job.created_at,
            updated_at: job.updated_at,
        });
    });
    // Define file path
    const filePath = path_1.default.join(__dirname, `../../uploads/files/jobs-${Date.now()}.xlsx`);
    // Write to file
    yield workbook.xlsx.writeFile(filePath);
    return filePath;
});
exports.generateExcelFile = generateExcelFile;
