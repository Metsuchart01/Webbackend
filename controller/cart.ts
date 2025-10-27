import express from "express";
import { conn } from "../dbConnecDatabase";
import { upload } from "../middle/upload";
import { count } from "console";

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
router.post("/checkout/:userId", async (req, res) => {
  const { userId } = req.params;
  const { code, total } = req.body;

  const connection = await conn.getConnection();
  try {
    await connection.beginTransaction();

    // โหลดรายการในตะกร้า
    const [cart]: any = await connection.query(
      `SELECT c.gid, g.price, c.quantity
       FROM Newwcart c
       JOIN game g ON c.gid = g.gid
       WHERE c.id = ?`, [userId]
    );

    if (cart.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: "ตะกร้าว่าง" });
    }

    // คำนวณยอดรวม
    let totalPrice = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);


    // if (code) {
    //   const [rows]: any = await connection.query(
    //     `select *  from DiscountCodes where code = ? and isActive = 1 `, [code]

    //   );
    //   if (rows.length > 0) {
    //     const discount = rows[0];
    //     const [usage]: any = await conn.query(
    //       "SELECT COUNT(*) as used FROM DiscountUsage WHERE cid=? AND user_id=?",
    //       [discount.cid, userId]
    //     );
    //     if (usage[0].used >= discount.UserLimit) {
    //       return res.json({ valid: false, message: "คุณใช้โค้ดนี้ครบจำนวนแล้ว" });
    //     }
    //     // 3. คำนวณส่วนลด
    //     if (discount.DiscountType === "percent") {
    //       totalPrice = total - (total * discount.DiscountValue) / 100;
    //     } else if (discount.DiscountType === "fixed") {
    //       totalPrice = Math.max(total - discount.DiscountValue, 0);
    //     }
    //     await connection.query(`insert into DiscountUsage(cid,UserId) values (?,?)`, [discount.cid, userId])

    //   }

    // }
    // ถ้า frontend ส่ง total มา (เช่นหักโค้ดแล้ว) ใช้แทน
    if (total && total < totalPrice) {
      totalPrice = total;
    }

    // ตรวจสอบเงินผู้ใช้
    const [users]: any = await connection.query("SELECT money FROM users WHERE id = ?", [userId]);
    if (users.length === 0 || users[0].money < totalPrice) {
      await connection.rollback();
      return res.status(400).json({ message: "ยอดเงินไม่เพียงพอ" });
    }

    // หักเงิน
    await connection.query("UPDATE users SET money = money - ? WHERE id = ?", [totalPrice, userId]);

    // เพิ่มเข้า sales
    for (const item of cart) {
      await connection.query(
        "INSERT INTO sales (user_id, game_id, quantity, purchase_date) VALUES (?, ?, ?, NOW())",
        [userId, item.gid, item.quantity]
      );
    }

    // ล้างตะกร้า
    await connection.query("DELETE FROM Newwcart WHERE id = ?", [userId]);

    await connection.commit();
    res.json({ message: "ซื้อสำเร็จ", totalPaid: totalPrice });
  } catch (err) {
    await connection.rollback();
    console.error("Checkout error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err });
  } finally {
    connection.release();
  }
});



// ✅ ตรวจสอบโค้ดส่วนลด
router.post("/validate-discount", async (req, res) => {
  const { code, total, userId } = req.body;

  try {
    // 1. หาโค้ดจาก DB
    const [rows]: any = await conn.query(
      "SELECT * FROM DiscountCodes WHERE Code=? AND isActive=1",
      [code]
    );
    if (rows.length === 0) {
      return res.json({ valid: false, message: "โค้ดไม่ถูกต้อง" });
    }
    const discount = rows[0];

    // 2. เช็คจำนวนการใช้งาน
    const [usage]: any = await conn.query(
      "SELECT COUNT(*) as used FROM DiscountUsage WHERE cid=? AND UserId=?",
      [discount.cid, userId]
    );
    if (usage[0].used >= discount.UserLimit) {
      return res.json({ valid: false, message: "คุณใช้โค้ดนี้ครบจำนวนแล้ว" });
    }

    // 3. คำนวณส่วนลด
    let newTotal = total;
    if (discount.DiscountType === "percent") {
      newTotal = total - (total * discount.DiscountValue) / 100;
    } else if (discount.DiscountType === "fixed") {
      newTotal = Math.max(total - discount.DiscountValue, 0);
    }

    return res.json({
      valid: true,
      discountType: discount.DiscountType,
      discountValue: discount.DiscountValue,
      newTotal,
    });
  } catch (err) {
    console.error("Validate discount error:", err);
    res.status(500).json({ valid: false, message: "เกิดข้อผิดพลาด" });
  }
});

