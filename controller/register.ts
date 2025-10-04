import express from "express";
import bcrypt from "bcrypt";
import { conn } from "../dbConnecDatabase";
import { ResultSetHeader } from "mysql2";
import { upload } from "../middle/upload";
import path from "path";
import fs from "fs";

export const router = express.Router();

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
router.post("/", upload.single("profile"), async (req, res) => {
    const {
        username,
        email,
        phone,
        password,
    } = req.body;
    try {
        const hashPassword = await bcrypt.hash(password, 10); //await bcrypt.hash(password,10);
        const [row] = await conn.query("select * from users where email = ?", [email]);
        if ((row as any[]).length > 0) {
            return res.status(400).json({ message: "Email มีคนใช้ไปแล้ว !! " });

        }
        const profilepath = req.file ? `/uploads/${req.file.filename}` : null;

        const [result] = await conn.query<ResultSetHeader>("insert into users(username,email,phone,password_hash,imageProfile) values(?,?,?,?,?)", [username, email, phone, hashPassword, profilepath]);
        return res.status(200).json({ message: "สมัครสมาชิกสำเร็จ", userId: result.insertId, profile: profilepath });

    }
    catch (error) {
        return res.status(500).json({
            message: "เกิดข้อผิดพลาดในการลงทะเบียน",
            error: (error as Error).message // <-- แก้ตรงนี้
        });
    }
});
