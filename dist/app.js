"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const register_1 = require("./controller/register");
const login_1 = require("./controller/login");
const index_1 = require("./controller/index");
const user_1 = require("./controller/user");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jwtAuth_1 = require("./middle/jwtAuth");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
exports.app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
exports.app.use("/", index_1.router);
exports.app.use("/register", register_1.router);
exports.app.use("/login", login_1.router);
exports.app.use(jwtAuth_1.jwtAuthen); // ตรวจสอบ JWT ก่อนเข้าถึง route ที่ไม่ได้ยกเว้น
exports.app.use("/user", user_1.router);
//# sourceMappingURL=app.js.map