import ExcelJS from 'exceljs';
import { Job } from '../models/jobModel';
import path from 'path';

/**
 * ✅ Generate an Excel file for job listings
 */
export const generateExcelFile = async (jobs: Job[]): Promise<string> => {
    const workbook = new ExcelJS.Workbook();
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
    const filePath = path.join(__dirname, `../../uploads/files/jobs-${Date.now()}.xlsx`);

    // Write to file
    await workbook.xlsx.writeFile(filePath);

    return filePath;
};
