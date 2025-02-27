import { Request, Response, NextFunction } from 'express';

/**
 * ✅ Handle company logo upload
 */
export const uploadCompanyLogoHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }

        const logoUrl = `/uploads/images/${req.file.filename}`;
        res.status(200).json({ success: true, message: 'Logo uploaded successfully', logoUrl });
    } catch (error) {
        next(error);
    }
};
