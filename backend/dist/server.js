"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobRoutes_1 = require("./routes/jobRoutes");
const userRoutes_1 = require("./routes/userRoutes");
const setupDb_1 = require("./config/setupDb");
const errorHandler_1 = require("./middlewares/errorHandler");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const companyRoutes_1 = require("./routes/companyRoutes");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(0, setupDb_1.createTables)();
app.use('/api/jobs', jobRoutes_1.jobRoutes);
app.use('/api/users', userRoutes_1.userRoutes);
app.use('/api/company', companyRoutes_1.companyRoutes); // ✅ Added user routes
// Error handling middleware
app.use(errorHandler_1.errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
