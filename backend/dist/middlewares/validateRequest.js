"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateJobUpdate = exports.validateJob = exports.updateJobSchema = exports.jobSchema = void 0;
const joi_1 = __importDefault(require("joi"));
/**
 * ✅ Job creation validation
 */
exports.jobSchema = joi_1.default.object({
    title: joi_1.default.string().max(255).required(),
    description: joi_1.default.string().required(),
    salary: joi_1.default.number().required(),
    location: joi_1.default.string().max(255).required(),
    category: joi_1.default.string().max(100).required(),
    posted_by_id: joi_1.default.string().uuid().optional(),
    posted_by_email: joi_1.default.string().optional(),
});
/**
 * ✅ Job update validation (partial updates allowed)
 */
exports.updateJobSchema = joi_1.default.object({
    title: joi_1.default.string().max(255).optional(),
    description: joi_1.default.string().optional(),
    salary: joi_1.default.number().optional(),
    location: joi_1.default.string().max(255).optional(),
    category: joi_1.default.string().max(100).optional(),
}).min(1); // Ensures at least one field is updated
/**
 * ✅ Middleware to validate job creation requests
 */
const validateJob = (req, res, next) => {
    const { error } = exports.jobSchema.validate(req.body);
    if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
    }
    next();
};
exports.validateJob = validateJob;
/**
 * ✅ Middleware to validate job update requests
 */
const validateJobUpdate = (req, res, next) => {
    const { error } = exports.updateJobSchema.validate(req.body);
    if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
    }
    next();
};
exports.validateJobUpdate = validateJobUpdate;
