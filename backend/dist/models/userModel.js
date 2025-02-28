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
exports.deleteUser = exports.validateUser = exports.findUserByEmail = exports.createUser = void 0;
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 10;
/**
 * ✅ Register a new user with hashed password
 */
const createUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(password, SALT_ROUNDS);
    const query = `INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *;`;
    const result = yield db_1.pool.query(query, [email, hashedPassword]);
    return result.rows.length ? result.rows[0] : null;
});
exports.createUser = createUser;
/**
 * ✅ Find a user by email
 */
const findUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `SELECT * FROM users WHERE email = $1;`;
    const result = yield db_1.pool.query(query, [email]);
    return result.rows.length ? result.rows[0] : null;
});
exports.findUserByEmail = findUserByEmail;
/**
 * ✅ Validate user login
 */
const validateUser = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield (0, exports.findUserByEmail)(email);
    if (!user)
        return null;
    const isValid = yield bcrypt_1.default.compare(password, user.password);
    return isValid ? user : null;
});
exports.validateUser = validateUser;
/**
 * ✅ Delete a user and their associated jobs
 */
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `DELETE FROM users WHERE id = $1 RETURNING *;`;
    const result = yield db_1.pool.query(query, [id]);
    return result.rows[0] || null;
});
exports.deleteUser = deleteUser;
