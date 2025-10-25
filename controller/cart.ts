import express from "express";
import { conn } from "../dbConnecDatabase";

export const router = express.Router();

// ➕ เพิ่มเกมเข้าตะกร้า
router.post("/add", async (req, res) => {
  const { userId, gameId, quantity } = req.body;

  if (!userId || !gameId) {
    return res.status(400).json({ message: "ต้องระบุ userId และ gameId" });
  }

  try {
    // เช็คว่า user ใส่เกมนี้ใน cart แล้วหรือยัง
    const [rows]: any = await conn.query(
      "SELECT * FROM cart WHERE id=? AND gid=?",
      [userId, gameId]
    );

    if (rows.length > 0) {
      // ถ้ามีอยู่แล้ว → อัปเดตจำนวน
      await conn.query(
        "UPDATE cart SET quantity = quantity + ? WHERE id=? AND gid=?",
        [quantity || 1, userId, gameId]
      );
    } else {
      // ถ้ายังไม่มี → insert ใหม่
      await conn.query(
        "INSERT INTO cart (id, gid, quantity) VALUES (?, ?, ?)",
        [userId, gameId, quantity || 1]
      );
    }

    res.json({ message: "เพิ่มลงตะกร้าสำเร็จ" });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
  }
});

// 📋 ดูตะกร้าของผู้ใช้
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const [rows]: any = await conn.query(
      `SELECT c.cart_id, g.NameGame, g.price, c.quantity, g.imageGame, 
              (g.price * c.quantity) AS total_price
       FROM cart c
       JOIN games g ON c.gid = g.gid
       WHERE c.id = ?`,
      [userId]
    );

    const [total]: any = await conn.query(
      `SELECT SUM(g.price * c.quantity) AS total_price
       FROM cart c
       JOIN games g ON c.gid = g.gid
       WHERE c.id = ?`,
      [userId]
    );

    res.json({
      items: rows,
      total: total[0].total_price || 0
    });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
  }
});

// ❌ ลบเกมออกจากตะกร้า
router.delete("/:cartId", async (req, res) => {
  const { cartId } = req.params;

  try {
    await conn.query("DELETE FROM cart WHERE cart_id = ?", [cartId]);
    res.json({ message: "ลบสินค้าออกจากตะกร้าแล้ว" });
  } catch (err) {
    console.error("Delete cart error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
  }
});
