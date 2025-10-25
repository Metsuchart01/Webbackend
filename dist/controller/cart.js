"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const dbConnecDatabase_1 = require("../dbConnecDatabase");
exports.router = express_1.default.Router();
/**
 * ➕ เพิ่มเกมเข้าตะกร้า
 * POST /cart/add
 * body: { userId, gameId, quantity }
 */
exports.router.post("/add", async (req, res) => {
    const { userId, gameId, quantity } = req.body;
    if (!userId || !gameId) {
        return res.status(400).json({ message: "ต้องระบุ userId และ gameId" });
    }
    try {
        // ตรวจสอบว่ามีเกมนี้อยู่ในตะกร้าแล้วหรือยัง
        const [rows] = await dbConnecDatabase_1.conn.query("SELECT * FROM Newwcart WHERE id=? AND gid=?", [userId, gameId]);
        if (rows.length > 0) {
            // ถ้ามีแล้ว → update quantity
            await dbConnecDatabase_1.conn.query("UPDATE Newwcart SET quantity = quantity + ? WHERE id=? AND gid=?", [quantity || 1, userId, gameId]);
        }
        else {
            // ถ้ายังไม่มี → insert ใหม่
            await dbConnecDatabase_1.conn.query("INSERT INTO Newwcart (id, gid, quantity) VALUES (?, ?, ?)", [userId, gameId, quantity || 1]);
        }
        res.json({ message: "เพิ่มลงตะกร้าสำเร็จ" });
    }
    catch (err) {
        console.error("Add to cart error:", err);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
    }
});
/**
 * 📋 ดูตะกร้าของ user
 * GET /cart/:userId
 */
exports.router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await dbConnecDatabase_1.conn.query(`SELECT c.cart_id, g.NameGame, g.price, c.quantity, g.imageGame,
              (g.price * c.quantity) AS total_price
       FROM Newwcart c
       JOIN game g ON c.gid = g.gid
       WHERE c.id = ?`, [userId]);
        const [total] = await dbConnecDatabase_1.conn.query(`SELECT SUM(g.price * c.quantity) AS total_price
       FROM Newwcart c
       JOIN game g ON c.gid = g.gid
       WHERE c.id = ?`, [userId]);
        res.json({
            items: rows,
            total: total[0]?.total_price || 0
        });
    }
    catch (err) {
        console.error("Get cart error:", err);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
    }
});
/**
 * ❌ ลบเกมออกจากตะกร้า
 * DELETE /cart/:cartId
 */
exports.router.delete("/:cartId", async (req, res) => {
    const { cartId } = req.params;
    try {
        await dbConnecDatabase_1.conn.query("DELETE FROM Newwcart WHERE cart_id = ?", [cartId]);
        res.json({ message: "ลบสินค้าออกจากตะกร้าแล้ว" });
    }
    catch (err) {
        console.error("Delete cart error:", err);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
    }
});
//# sourceMappingURL=cart.js.map