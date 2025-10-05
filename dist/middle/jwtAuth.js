"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtAuthen = void 0;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const express_jwt_1 = require("express-jwt");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const secret = process.env.JWT_SECRET;
exports.jwtAuthen = (0, express_jwt_1.expressjwt)({
    secret: secret,
    algorithms: ["HS256"],
}).unless({
    path: ["/", "/register", "/login"],
});
function generateToken(payload) {
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: "30m", // หมดอายุ 30 วัน
        issuer: "CS-MSU",
    });
}
// ตรวจสอบ JWT ด้วยตัวเอง (ถ้าจำเป็น)
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        return { valid: true, decoded };
    }
    catch (error) {
        return { valid: false, error: error.message };
    }
}
//# sourceMappingURL=jwtAuth.js.map