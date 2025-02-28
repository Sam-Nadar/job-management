"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
const authenticateUser = (req, res, next) => {
    console.log("Incoming Headers:", req.headers.authorization); // ✅ Debugging
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("⚠️ No valid Authorization header received");
        res.status(401).json({ success: false, message: "Access denied. No token provided." });
        return;
    }
    const token = authHeader.split(" ")[1]; // Extract token
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email }; // ✅ Attach user data to request
        console.log("Decoded JWT User:", req.user); // ✅ Debugging
        next();
    }
    catch (error) {
        console.error("⚠️ Invalid Token:", error.message);
        res.status(403).json({ success: false, message: "Invalid token" });
    }
};
exports.authenticateUser = authenticateUser;
