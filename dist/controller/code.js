"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = __importDefault(require("express"));
const dbConnecDatabase_1 = require("../dbConnecDatabase");
const upload_1 = require("../middle/upload");
exports.router = express_1.default.Router();
exports.router.get("/", async (req, res) => {
    try {
        const [row] = await dbConnecDatabase_1.conn.query(`SELECT 
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
      GROUP BY d.cid
      ORDER BY d.cid;`);
        const codes = row.map(c => ({
            cid: c.cid,
            code: c.Code,
            description: c.Description,
            discountType: c.DiscountType, // ลดเป็น %
            discountValue: c.DiscountValue,
            maxUsage: c.MaxUsage,
            userLimit: c.UserLimit,
            //   usedCount: c.,
            isActive: c.isActive,
            discountUsage: c.discountUsage
        }));
        return res.status(200).json(codes);
    }
    catch (error) {
        console.error("Error fetching discount codes:", error);
        return res.status(500).json({ message: "Error fetching discount codes" });
    }
});
exports.router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await dbConnecDatabase_1.conn.query(`
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching discount code" });
    }
});
exports.router.post("/", upload_1.upload.none(), async (req, res) => {
    try {
        console.log(req.body); // ตรวจสอบว่ามีค่า
        const { code, description, discountType, discountValue, maxUsage, userLimit } = req.body;
        const sql = `
      INSERT INTO DiscountCodes
      (Code, Description, DiscountType, DiscountValue, MaxUsage, UserLimit,isActive)
      VALUES (?, ?, ?, ?, ?, ?,?)
    `;
        const [result] = await dbConnecDatabase_1.conn.query(sql, [code, description, discountType, parseFloat(discountValue),
            parseInt(maxUsage),
            parseInt(userLimit), 1]);
        res.status(200).json({ message: "Code added", insertId: result.insertId });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding discount code" });
    }
});
/* ---------------- PUT: แก้ไขโค้ด ---------------- */
exports.router.put("/:id", upload_1.upload.none(), async (req, res) => {
    try {
        const { id } = req.params;
        const { code, description, discountType, discountValue, maxUsage, userLimit } = req.body;
        const sql = `
      UPDATE DiscountCodes
      SET Code=?, Description=?, DiscountType=?, DiscountValue=?, MaxUsage=?, UserLimit=?
      WHERE cid=?
    `;
        await dbConnecDatabase_1.conn.query(sql, [code, description, discountType, discountValue, maxUsage, userLimit, id]);
        res.status(200).json({ message: "Code updated" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating discount code" });
    }
});
/* ---------------- DELETE: ลบโค้ด ---------------- */
exports.router.delete("/:id", upload_1.upload.none(), async (req, res) => {
    try {
        const { id } = req.params;
        await dbConnecDatabase_1.conn.query("DELETE FROM DiscountCodes WHERE cid=?", [id]);
        res.status(200).json({ message: "Code deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting discount code" });
    }
});
//# sourceMappingURL=code.js.map