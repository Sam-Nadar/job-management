import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET as string;

interface AuthRequest extends Request {
    user?: { id: string; email: string };
}

export const authenticateUser = (req: AuthRequest, res: Response, next: NextFunction): void => {
    console.log("Incoming Headers:", req.headers.authorization); // ✅ Debugging

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("⚠️ No valid Authorization header received");
        res.status(401).json({ success: false, message: "Access denied. No token provided." });
        return;
    }

    const token = authHeader.split(" ")[1]; // Extract token

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
        req.user = { id: decoded.id, email: decoded.email }; // ✅ Attach user data to request
        console.log("Decoded JWT User:", req.user); // ✅ Debugging
        next();
    } catch (error:any) {
        console.error("⚠️ Invalid Token:", error.message);
        res.status(403).json({ success: false, message: "Invalid token" });
    }
};
