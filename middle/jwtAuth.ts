import { expressjwt } from "express-jwt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const secret = process.env.JWT_SECRET!;

export const jwtAuthen = expressjwt({
    secret: secret,
    algorithms: ["HS256"],
}).unless({
    path: ["/", "/register", "/login"],
});
export function generateToken(payload: any): string {
    return jwt.sign(payload, secret, {
        expiresIn: "30d", // หมดอายุ 30 วัน
        issuer: "CS-MSU",
    });
}

// ตรวจสอบ JWT ด้วยตัวเอง (ถ้าจำเป็น)
export function verifyToken(token: string) {
    try {
        const decoded = jwt.verify(token, secret);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error: (error as Error).message };
    }
}