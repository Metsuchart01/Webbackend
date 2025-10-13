// controller/user.ts
import express from "express";
import { conn } from "../dbConnecDatabase";
import { upload } from "../middle/upload";

export const router = express.Router();

router.get("/", async (req, res) => {
    const [rows] = await conn.query('select  id, username, email, phone, imageProfile, role from users');
    const users = (rows as any[]).map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profileUrl: user.imageProfile ? `https://webbackend01.onrender.com${user.imageProfile}` : null,
        role: user.role
    }));
    return res.status(200).json(users); // ✅ คืนเป็น Array
});



router.get("/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const [rows] = await conn.query(
            "SELECT id, username, email, phone, imageProfile,role FROM users WHERE id = ?",
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
            role: user.role
        });
    } catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});
