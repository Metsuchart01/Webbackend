"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbConnecDatabase_1 = require("../dbConnecDatabase");
const upload_1 = require("../middle/upload");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.router = express_1.default.Router();
const uploadsDir = path_1.default.join(__dirname, "../uploads");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
exports.router.post("/", upload_1.upload.single("profile"), async (req, res) => {
    const { username, email, phone, password, } = req.body;
    try {
        const hashPassword = await bcrypt_1.default.hash(password, 10); //await bcrypt.hash(password,10);
        const [row] = await dbConnecDatabase_1.conn.query("select * from users where email = ?", [email]);
        if (row.length > 0) {
            return res.status(400).json({ message: "Email มีคนใช้ไปแล้ว !! " });
        }
        const profilepath = req.file ? `/uploads/${req.file.filename}` : null;
        const [result] = await dbConnecDatabase_1.conn.query("insert into users(username,email,phone,password_hash,imageProfile) values(?,?,?,?,?)", [username, email, phone, hashPassword, profilepath]);
        return res.status(200).json({ status: "200", message: "สมัครสมาชิกสำเร็จ", userId: result.insertId, profile: profilepath });
    }
    catch (error) {
        return res.status(500).json({
            status: "500",
            message: "เกิดข้อผิดพลาดในการลงทะเบียน",
            error: error.message // <-- แก้ตรงนี้
        });
    }
});
//# sourceMappingURL=register.js.map