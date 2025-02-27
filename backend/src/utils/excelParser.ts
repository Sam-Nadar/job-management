import ExcelJS from 'exceljs';

export const parseExcel = async (filePath: string): Promise<any[]> => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const data: any[] = [];
    const headers: string[] = [];

    // ✅ Trim headers to remove extra spaces
    worksheet.getRow(1).eachCell((cell) => {
        headers.push(cell.text.trim()); // ✅ Trim whitespace
    });

    // Read data from rows
    worksheet.eachRow((row, rowIndex) => {
        if (rowIndex !== 1) { // Skip header row
            const rowData: Record<string, any> = {};
            row.eachCell((cell, cellIndex) => {
                const columnName = headers[cellIndex - 1]; // Get column name
                rowData[columnName] = cell.value; // Assign value
            });
            data.push(rowData);
        }
    });

    return data;
};
