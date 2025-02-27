"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyRoutes = void 0;
const express_1 = __importDefault(require("express"));
const companyController_1 = require("../controllers/companyController");
const upload_1 = require("../middlewares/upload");
const router = express_1.default.Router();
exports.companyRoutes = router;
router.post('/upload-logo', upload_1.uploadCompanyLogo, companyController_1.uploadCompanyLogoHandler);
