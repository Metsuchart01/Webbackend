"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conn = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
exports.conn = promise_1.default.createPool({
    host: "202.28.34.210",
    port: 3309, // ตรวจสอบให้ตรงกับ MySQL
    user: "66011212095",
    password: "66011212095",
    database: "db66011212095",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
console.log("MySQL pool created:", exports.conn ? true : false);
//# sourceMappingURL=dbConnecDatabase.js.map