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
    // Define columns
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Title', key: 'title', width: 20 },
        { header: 'Description', key: 'description', width: 30 },
        { header: 'Salary', key: 'salary', width: 15 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Posted By', key: 'postedById', width: 30 },
        { header: 'Created At', key: 'createdAt', width: 20 },
        { header: 'Updated At', key: 'updatedAt', width: 20 },
    ];
    // Add job data rows
    jobs.forEach(job => {
        worksheet.addRow(job);
    });
    // Define file path
    const filePath = path_1.default.join(__dirname, `../../uploads/files/jobs-${Date.now()}.xlsx`);
    // Write to file
    yield workbook.xlsx.writeFile(filePath);
    return filePath;
});
exports.generateExcelFile = generateExcelFile;
