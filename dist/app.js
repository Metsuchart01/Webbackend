"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const register_1 = require("./controller/register");
const login_1 = require("./controller/login");
const index_1 = require("./controller/index");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use("/uploads", express_1.default.static("uploads"));
exports.app.use("/", index_1.router);
//app.use("/users", users);
exports.app.use("/register", register_1.router);
exports.app.use("/login", login_1.router);
//# sourceMappingURL=app.js.map