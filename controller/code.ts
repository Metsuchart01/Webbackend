import express from "express";
import { conn } from "../dbConnecDatabase";
import { upload } from "../middle/upload";

export const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [rows]: any = await conn.query(`
      SELECT 
        d.cid,
        d.Code,
        d.Description,
        d.DiscountType,
        d.DiscountValue,
        d.MaxUsage,
        d.UserLimit,
        d.isActive,
        COUNT(u.cid) AS discountUsage,
        COUNT(DISTINCT u.UserId) AS userCount
      FROM DiscountCodes d
      LEFT JOIN DiscountUsage u ON d.cid = u.cid
      GROUP BY d.cid
      ORDER BY d.cid;
    `);

        const codes = rows.map((c: any) => ({
            cid: c.cid,
            code: c.Code,
            description: c.Description,
            discountType: c.DiscountType,
            discountValue: c.DiscountValue,
            maxUsage: c.MaxUsage,
            userLimit: c.UserLimit,
            isActive: c.isActive,
            discountUsage: c.discountUsage, // จำนวนการใช้ทั้งหมด
            userCount: c.userCount          // จำนวนผู้ใช้ที่ใช้โค้ดนี้
        }));

        return res.status(200).json(codes);
    } catch (error) {
        console.error("Error fetching discount codes:", error);
        return res.status(500).json({ message: "Error fetching discount codes" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [rows]: any = await conn.query(`
      SELECT 
        d.cid,
        d.Code,
        d.Description,
        d.DiscountType,
        d.DiscountValue,
        d.MaxUsage,
        d.UserLimit,
        d.isActive,
        COUNT(u.cid) AS discountUsage
      FROM DiscountCodes d
      LEFT JOIN DiscountUsage u ON d.cid = u.cid
      WHERE d.cid = ?
      GROUP BY d.cid
    `, [id]);

        if (!rows.length) {
            return res.status(404).json({ message: "Discount code not found" });
        }

        const code = rows[0];
        res.status(200).json({
            cid: code.cid,
            code: code.Code,
            description: code.Description,
            discountType: code.DiscountType,
            discountValue: code.DiscountValue,
            maxUsage: code.MaxUsage,
            userLimit: code.UserLimit,
            isActive: !!code.isActive,
            discountUsage: code.discountUsage
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching discount code" });
    }
});

router.post("/", upload.none(), async (req, res) => {
    try {
        console.log(req.body); // ตรวจสอบว่ามีค่า

        const { code, description, discountType, discountValue, maxUsage, userLimit } = req.body;
        const sql = `
      INSERT INTO DiscountCodes
      (Code, Description, DiscountType, DiscountValue, MaxUsage, UserLimit,isActive)
      VALUES (?, ?, ?, ?, ?, ?,?)
    `;
        const [result]: any = await conn.query(sql, [code, description, discountType, parseFloat(discountValue),
            parseInt(maxUsage),
            parseInt(userLimit), 1]);
        res.status(200).json({ message: "Code added", insertId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding discount code" });
    }
});

/* ---------------- PUT: แก้ไขโค้ด ---------------- */
router.put("/:id", upload.none(), async (req, res) => {
    try {
        const { id } = req.params;
        const { code, description, discountType, discountValue, maxUsage, userLimit } = req.body;
        const sql = `
      UPDATE DiscountCodes
      SET Code=?, Description=?, DiscountType=?, DiscountValue=?, MaxUsage=?, UserLimit=?
      WHERE cid=?
    `;
        await conn.query(sql, [code, description, discountType, discountValue, maxUsage, userLimit, id]);
        res.status(200).json({ message: "Code updated" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating discount code" });
    }
});

/* ---------------- DELETE: ลบโค้ด ---------------- */
router.delete("/:id", upload.none(), async (req, res) => {
    try {
        const { id } = req.params;
        await conn.query("DELETE FROM DiscountCodes WHERE cid=?", [id]);
        res.status(200).json({ message: "Code deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting discount code" });
    }
});