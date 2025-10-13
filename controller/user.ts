// controller/user.ts
import express from "express";
import { conn } from "../dbConnecDatabase";
import { upload } from "../middle/upload";

export const router = express.Router();

router.get("/", async (req, res) => {
    const [rows] = await conn.query('select  id, username, email, phone, imageProfile, role ,money from users');
    const users = (rows as any[]).map(user => ({
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



router.get("/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const [rows] = await conn.query(
            "SELECT id, username, email, phone, imageProfile,role ,money FROM users WHERE id = ?",
            [userId]
        );

        if ((rows as any[]).length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }

        const user = (rows as any[])[0];
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
    } catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});

router.patch("/:id/topup", async (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    try {
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: "กรุณาระบุจำนวนเงินที่ถูกต้อง" });
        }

        // ✅ เพิ่มเงินเข้าในช่อง money
        const [result]: any = await conn.query(
            "UPDATE users SET money = money + ? WHERE id = ?",
            [amount, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }

        await conn.query("INSERT INTO topup (user_id, amount) VALUES (?, ?)", [id, amount]
        )

        // ✅ ดึงข้อมูลใหม่กลับมา
        const [rows]: any = await conn.query(
            "SELECT id, username, email, phone, money FROM users WHERE id = ?",
            [id]
        );
        const user = rows[0];

        res.json({
            message: "เติมเงินสำเร็จ",
            user
        });
    } catch (error) {
        console.error("Topup error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});
