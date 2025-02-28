import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * ✅ Job creation validation
 */
export const jobSchema = Joi.object({
    title: Joi.string().max(255).required(),
    description: Joi.string().required(),
    salary: Joi.number().required(),
    location: Joi.string().max(255).required(),
    category: Joi.string().max(100).required(),
    posted_by_id: Joi.string().uuid().optional(),
    posted_by_email: Joi.string().optional(),
});

/**
 * ✅ Job update validation (partial updates allowed)
 */
export const updateJobSchema = Joi.object({
    title: Joi.string().max(255).optional(),
    description: Joi.string().optional(),
    salary: Joi.number().optional(),
    location: Joi.string().max(255).optional(),
    category: Joi.string().max(100).optional(),
}).min(1); // Ensures at least one field is updated

/**
 * ✅ Middleware to validate job creation requests
 */
export const validateJob = (req: Request, res: Response, next: NextFunction): void => {
    const { error } = jobSchema.validate(req.body);
    if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
    }
    next();
};

/**
 * ✅ Middleware to validate job update requests
 */
export const validateJobUpdate = (req: Request, res: Response, next: NextFunction): void => {
    const { error } = updateJobSchema.validate(req.body);
    if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
    }
    next();
};
