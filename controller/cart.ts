import express from "express";
import { conn } from "../dbConnecDatabase";

export const router = express.Router();

// ➕ เพิ่มเกมเข้าตะกร้า (เช็คว่าซื้อไปแล้วหรือยัง)
router.post("/add", async (req, res) => {
  const { userId, gameId, quantity } = req.body;

  if (!userId || !gameId) {
    return res.status(400).json({ message: "ต้องระบุ userId และ gameId" });
  }

  try {
    // 1. ตรวจสอบว่าเกมนี้ถูกซื้อแล้วหรือยัง
    const [saleRows]: any = await conn.query(
      "SELECT * FROM sales WHERE user_id = ? AND game_id = ?",
      [userId, gameId]
    );

    if (saleRows.length > 0) {
      return res.status(400).json({ message: "คุณได้ซื้อเกมนี้ไปแล้ว ไม่สามารถเพิ่มลงตะกร้าได้อีก" });
    }

    // 2. ตรวจสอบว่าเกมมีอยู่ในตะกร้าแล้วหรือยัง
    const [rows]: any = await conn.query(
      "SELECT * FROM Newwcart WHERE id=? AND gid=?",
      [userId, gameId]
    );

    if (rows.length > 0) {
      // ถ้ามีอยู่แล้ว → อัปเดตจำนวน
      await conn.query(
        "UPDATE Newwcart SET quantity = quantity + ? WHERE id=? AND gid=?",
        [quantity || 1, userId, gameId]
      );
    } else {
      // ถ้ายังไม่มี → insert ใหม่
      await conn.query(
        "INSERT INTO Newwcart (id, gid, quantity) VALUES (?, ?, ?)",
        [userId, gameId, quantity || 1]
      );
    }

    res.json({ message: "เพิ่มลงตะกร้าสำเร็จ" });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
  }
});


/* ---------------- ดูตะกร้า ---------------- */
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { discountCode } = req.query; // รับโค้ดส่วนลดจาก query params

  try {
    const [rows]: any = await conn.query(
      `SELECT c.gid, g.NameGame, g.price, c.quantity, g.imageGame,
              (g.price * c.quantity) AS total_price
       FROM Newwcart c
       JOIN game g ON c.gid = g.gid
       WHERE c.id = ?`,
      [userId]
    );

    const [total]: any = await conn.query(
      `SELECT SUM(g.price * c.quantity) AS total_price
       FROM Newwcart c
       JOIN game g ON c.gid = g.gid
       WHERE c.id = ?`,
      [userId]
    );

    let finalTotal = total[0].total_price || 0;
    let discountInfo = null;

    // ✅ ถ้ามีโค้ดส่วนลด
    if (discountCode) {
      const [codes]: any = await conn.query(
        "SELECT * FROM DiscountCodes WHERE Code=? AND isActive=1",
        [discountCode]
      );
      if (codes.length > 0) {
        const code = codes[0];
        if (code.DiscountType === "percent") {
          finalTotal = finalTotal - (finalTotal * code.DiscountValue) / 100;
        } else if (code.DiscountType === "amount") {
          finalTotal = finalTotal - code.DiscountValue;
        }
        if (finalTotal < 0) finalTotal = 0;

        discountInfo = {
          code: code.Code,
          type: code.DiscountType,
          value: code.DiscountValue,
        };
      }
    }

    res.json({
      items: rows,
      total: finalTotal,
      discount: discountInfo,
    });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
  }
});

/* ---------------- ลบเกมออกจากตะกร้า ---------------- */
router.delete("/:userId/:gameId", async (req, res) => {
  const { userId, gameId } = req.params;

  try {
    await conn.query("DELETE FROM Newwcart WHERE id=? AND gid=?", [userId, gameId]);
    res.json({ message: "ลบเกมออกจากตะกร้าสำเร็จ" });
  } catch (err) {
    console.error("Delete cart error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
  }
});

/* ---------------- ซื้อเกมทั้งหมดในตะกร้า ---------------- */
router.post("/:userId/checkout", async (req, res) => {
  const { userId } = req.params;
  const { discountCode } = req.body;

  const connection = await conn.getConnection();
  try {
    await connection.beginTransaction();

    // โหลดตะกร้า
    const [cartItems]: any = await connection.query(
      `SELECT c.gid, g.price, c.quantity
       FROM Newwcart c
       JOIN game g ON c.gid = g.gid
       WHERE c.id=?`,
      [userId]
    );
    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "ไม่มีสินค้าในตะกร้า" });
    }

    // รวมราคา
    let total = cartItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // ใช้โค้ดส่วนลด
    if (discountCode) {
      const [codes]: any = await connection.query(
        "SELECT * FROM DiscountCodes WHERE Code=? AND isActive=1",
        [discountCode]
      );
      if (codes.length > 0) {
        const code = codes[0];
        if (code.DiscountType === "percent") {
          total = total - (total * code.DiscountValue) / 100;
        } else if (code.DiscountType === "amount") {
          total = total - code.DiscountValue;
        }
        if (total < 0) total = 0;
      }
    }

    // เช็คเงินผู้ใช้
    const [users]: any = await connection.query("SELECT money FROM users WHERE id=?", [userId]);
    if (users.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }
    if (users[0].money < total) {
      await connection.rollback();
      return res.status(400).json({ message: "ยอดเงินไม่พอ" });
    }

    // หักเงิน
    await connection.query("UPDATE users SET money = money - ? WHERE id=?", [total, userId]);

    // บันทึกการซื้อทีละเกม
    for (const item of cartItems) {
      await connection.query(
        "INSERT INTO sales (user_id, game_id, purchase_date) VALUES (?, ?, NOW())",
        [userId, item.gid]
      );
    }

    // ลบตะกร้า
    await connection.query("DELETE FROM Newwcart WHERE id=?", [userId]);

    await connection.commit();
    res.json({ message: "ซื้อเกมทั้งหมดสำเร็จ", total });
  } catch (err) {
    await connection.rollback();
    console.error("Checkout error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
  } finally {
    connection.release();
  }
});
