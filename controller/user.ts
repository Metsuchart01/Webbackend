// controller/user.ts
import express from "express";
import { conn } from "../dbConnecDatabase";
import { upload } from "../middle/upload";

export const router = express.Router();

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


// PUT /user/:id
router.put("/:id", upload.single("profile"), async (req, res) => {
    const userId = req.params.id;
    const { username, email, phone } = req.body;

    try {
        // เช็คว่าผู้ใช้มีอยู่
        const [rows] = await conn.query("SELECT id, imageProfile FROM users WHERE id = ?", [userId]);
        if ((rows as any[]).length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }

        const user = (rows as any[])[0];

        // ถ้าอัพโหลดรูปใหม่
        let profilePath = user.imageProfile;
        if (req.file) {
            profilePath = `/uploads/${req.file.filename}`;
        }

        // อัพเดตข้อมูล
        await conn.query(
            "UPDATE users SET username = ?, email = ?, phone = ?, imageProfile = ? WHERE id = ?",
            [username, email, phone, profilePath, userId]
        );

        return res.status(200).json({
            message: "อัพเดตข้อมูลสำเร็จ",
            profileUrl: profilePath ? `https://webbackend01.onrender.com${profilePath}` : null
        });
    } catch (error) {
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});
