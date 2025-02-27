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
exports.parseExcel = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const parseExcel = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new exceljs_1.default.Workbook();
    yield workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];
    const data = [];
    const headers = [];
    // ✅ Trim headers to remove extra spaces
    worksheet.getRow(1).eachCell((cell) => {
        headers.push(cell.text.trim()); // ✅ Trim whitespace
    });
    // Read data from rows
    worksheet.eachRow((row, rowIndex) => {
        if (rowIndex !== 1) { // Skip header row
            const rowData = {};
            row.eachCell((cell, cellIndex) => {
                const columnName = headers[cellIndex - 1]; // Get column name
                rowData[columnName] = cell.value; // Assign value
            });
            data.push(rowData);
        }
    });
    return data;
});
exports.parseExcel = parseExcel;
