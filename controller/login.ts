import express from "express";
import { conn } from "../dbConnecDatabase";
import bcrypt from "bcrypt";
import { User } from "../model/user";
import e from "cors";
import { stat } from "fs";
import { generateToken } from "../middle/jwtAuth";

export const router = express.Router();

router.post("/", async (req, res) => {
    const { email, password } = req.body;

    try {
        // ✅ ดึงข้อมูลผู้ใช้จากฐานข้อมูล
        const [rows] = await conn.query<User[]>(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        // ✅ ถ้าไม่พบ email
        if (rows.length === 0) {
            return res.status(400).json({ message: "ไม่มี email นี้ในระบบ !!" });
        }

        // ✅ ดึงข้อมูลผู้ใช้
        const user = rows[0];
        if (user) {
            // ✅ ตรวจสอบรหัสผ่าน
            const passwordMatch = await bcrypt.compare(password, user.password_hash);

            if (!passwordMatch) {
                return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
            }

            const token = generateToken({ id: user.id, email: user.email });
            // ✅ ถ้าถูกต้อง — ส่งข้อมูลกลับ
            return res.status(200).json({
                status: "200",
                message: "เข้าสู่ระบบสำเร็จ",
                token: token,
                user: {
                    id: user.id,
                }
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: "500",
            message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
            error: (error as Error).message
        });
    }
});
