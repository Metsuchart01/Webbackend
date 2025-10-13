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

router.patch("/:id/sales", async (req, res) => {
    const { id } = req.params;
    const { gid } = req.body;

    try {
        // 1. ดึงราคาเกม
        const [gameRows]: any = await conn.query(
            "SELECT price FROM game WHERE gid = ?",
            [gid]
        );
        if (gameRows.length === 0) {
            return res.status(404).json({ message: "ไม่พบเกมที่เลือก" });
        }
        const price = gameRows[0].price;

        // 2. ตรวจสอบเงินผู้ใช้
        const [userRows]: any = await conn.query(
            "SELECT money FROM users WHERE id = ?",
            [id]
        );
        if (userRows.length === 0) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้" });
        }
        const currentMoney = userRows[0].money;
        if (currentMoney < price) {
            return res.status(400).json({ message: "ยอดเงินไม่เพียงพอ" });
        }

        // 3. หักเงิน
        await conn.query(
            "UPDATE users SET money = money - ? WHERE id = ?",
            [price, id]
        );

        // 4. บันทึกการซื้อ
        await conn.query(
            "INSERT INTO sales (user_id, game_id, purchase_date) VALUES (?, ?, NOW())",
            [id, gid]
        );

        // 5. ส่งข้อมูลผู้ใช้กลับ
        const [updatedUserRows]: any = await conn.query(
            "SELECT id, username, email, phone, money FROM users WHERE id = ?",
            [id]
        );
        const user = updatedUserRows[0];

        res.json({
            message: "ซื้อเกมสำเร็จ",
            user
        });
    } catch (error) {
        console.error("Purchase error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});
router.get("/:id/topup", async (req, res) => {
    const { id } = req.params;
    try {

        const [rows] = await conn.query("select * from topup t JOIN users u ON t.user_id = u.id where user_id = ?", [id])

        const topups = (rows as any[]).map(topup => ({

            user_id: topup.user_id,
            username: topup.username,
            amount: topup.amount,
            topup_date: topup.topup_date


        }));
        res.status(200).json(topups);

    } catch (error) {
        console.error("Topup error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error });

    }

})
router.get("/:id/sales", async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await conn.query(
            `SELECT 
         s.id, s.user_id, u.username,
         g.NameGame, g.price, g.imageGame,
         s.purchase_date
       FROM sales s
       JOIN game g ON s.game_id = g.gid
       JOIN users u ON s.user_id = u.id
       WHERE s.user_id = ?`,
            [id]
        );
        const sales = (rows as any[]).map(sale => ({

            id: sale.id,
            user_id: sale.user_id,
            username: sale.username,
            NameGame: sale.NameGame,
            price: sale.price,
            purchase_date: sale.purchase_date


        }));
        res.status(200).json(sales);
    } catch (error) {
        console.error("Sales error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});
