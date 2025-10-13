"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
// controller/user.ts
const express_1 = __importDefault(require("express"));
const dbConnecDatabase_1 = require("../dbConnecDatabase");
exports.router = express_1.default.Router();
exports.router.get("/", async (req, res) => {
    const [rows] = await dbConnecDatabase_1.conn.query('select  id, username, email, phone, imageProfile, role ,money from users');
    const users = rows.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profileUrl: user.imageProfile ? `https://webbackend01.onrender.com${user.imageProfile}` : null,
        role: user.role,
        money: user.money
    }));
    return res.status(200).json(users); // ✅ คืนเป็น Array
});
exports.router.get("/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const [rows] = await dbConnecDatabase_1.conn.query("SELECT id, username, email, phone, imageProfile,role ,money FROM users WHERE id = ?", [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }
        const user = rows[0];
        const profileUrl = user.imageProfile ? `https://webbackend01.onrender.com${user.imageProfile}` : null;
        return res.status(200).json({
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone,
            profileUrl,
            role: user.role,
            money: user.money
        });
    }
    catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});
exports.router.patch("/:id/topup", async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;
    try {
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: "กรุณาระบุจำนวนเงินที่ถูกต้อง" });
        }
        // ✅ เพิ่มเงินเข้าในช่อง money
        const [result] = await dbConnecDatabase_1.conn.query("UPDATE users SET money = money + ? WHERE id = ?", [amount, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }
        await dbConnecDatabase_1.conn.query("INSERT INTO topup (user_id, amount) VALUES (?, ?)", [id, amount]);
        // ✅ ดึงข้อมูลใหม่กลับมา
        const [rows] = await dbConnecDatabase_1.conn.query("SELECT id, username, email, phone, money FROM users WHERE id = ?", [id]);
        const user = rows[0];
        res.json({
            message: "เติมเงินสำเร็จ",
            user
        });
    }
    catch (error) {
        console.error("Topup error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});
//# sourceMappingURL=user.js.map