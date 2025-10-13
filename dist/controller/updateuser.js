"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
// controller/user.ts
const express_1 = __importDefault(require("express"));
const dbConnecDatabase_1 = require("../dbConnecDatabase");
const upload_1 = require("../middle/upload");
exports.router = express_1.default.Router();
// PUT /user/:id
exports.router.put("/:id", upload_1.upload.single("profile"), async (req, res) => {
    const userId = req.params.id;
    const { username, email, phone } = req.body;
    try {
        // เช็คว่าผู้ใช้มีอยู่
        const [rows] = await dbConnecDatabase_1.conn.query("SELECT id, imageProfile FROM users WHERE id = ?", [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }
        const user = rows[0];
        // ถ้าอัพโหลดรูปใหม่
        let profilePath = user.imageProfile;
        if (req.file) {
            profilePath = `/uploads/imageProfile/${req.file.filename}`;
        }
        // อัพเดตข้อมูล
        await dbConnecDatabase_1.conn.query("UPDATE users SET username = ?, email = ?, phone = ?, imageProfile = ? WHERE id = ?", [username, email, phone, profilePath, userId]);
        return res.status(200).json({
            message: "อัพเดตข้อมูลสำเร็จ",
            profileUrl: profilePath ? `https://webbackend01.onrender.com${profilePath}` : null
        });
    }
    catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});
//# sourceMappingURL=updateuser.js.map