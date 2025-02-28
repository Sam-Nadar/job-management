import ExcelJS from 'exceljs';
import { Job } from '../models/jobModel';
import path from 'path';

/**
 * ✅ Generate an Excel file for job listings
 */
export const generateExcelFile = async (jobs: Job[]): Promise<string> => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Jobs');

    // Define columns (Removed `postedById`, Added `posted_by_email`)
    worksheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        { header: 'Title', key: 'title', width: 20 },
        { header: 'Description', key: 'description', width: 30 },
        { header: 'Salary', key: 'salary', width: 15 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Posted By (Email)', key: 'posted_by_email', width: 30 }, // ✅ Added email
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
            posted_by_email: job.posted_by_email, // ✅ Now includes email
            created_at: job.created_at,
            updated_at: job.updated_at,
        });
    });

    // Define file path
    const filePath = path.join(__dirname, `../../uploads/files/jobs-${Date.now()}.xlsx`);

    // Write to file
    await workbook.xlsx.writeFile(filePath);

    return filePath;
};
