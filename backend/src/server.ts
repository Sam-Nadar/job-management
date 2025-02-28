import express from 'express';
import { jobRoutes } from './routes/jobRoutes';
import { userRoutes } from './routes/userRoutes';
import { createTables } from './config/setupDb';
import { errorHandler } from './middlewares/errorHandler';
import dotenv from 'dotenv';
import cors from 'cors';
import { companyRoutes } from './routes/companyRoutes';
import { authRoutes } from './routes/authRoutes';
import path from "path";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

createTables();

app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);
app.use('/api/company',companyRoutes) // ✅ Added user routes
app.use('/api/auth', authRoutes); // ✅ Authentication routes

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
