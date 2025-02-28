"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
exports.authRoutes = router;
router.post('/register', authController_1.registerUser); // ✅ Register route
router.post('/login', authController_1.loginUser); // ✅ Login route
