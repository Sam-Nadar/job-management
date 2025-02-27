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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.createUser = void 0;
const db_1 = require("../config/db");
/**
 * ✅ Create a new user
 */
const createUser = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `INSERT INTO users (email) VALUES ($1) ON CONFLICT(email) DO NOTHING RETURNING *;`;
    const result = yield db_1.pool.query(query, [email]);
    return result.rows[0];
});
exports.createUser = createUser;
/**
 * ✅ Delete a user and their associated jobs
 */
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const query = `DELETE FROM users WHERE id = $1 RETURNING *;`;
    const result = yield db_1.pool.query(query, [id]);
    return result.rows[0] || null;
});
exports.deleteUser = deleteUser;
