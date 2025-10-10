import express from "express";
import { conn } from "../dbConnecDatabase";
import { upload } from "../middle/upload";

export const router = express.Router();


router.get("", async (req, res) => {
    try {
        const [rows] = await conn.query(`
            SELECT *
            FROM game 
        `);

        res.json(rows);  // ต้องส่ง response กลับ client



    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }

});

router.get("/rank", async (req, res) => {
    try {
        const [rows] = await conn.query(`
            SELECT g.gid, g.nameGame, g.price, g.type, g.imageGame, g.Description,
                   COALESCE(SUM(s.quantity),0) AS total_sales
            FROM game g
            LEFT JOIN sales s ON g.gid = s.game_id
            GROUP BY g.gid, g.nameGame, g.price, g.type, g.imageGame, g.Description
            ORDER BY total_sales DESC
            LIMIT 5;
        `);

        res.json(rows);  // ต้องส่ง response กลับ client
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

router.post("/add", async (req, res) => {
    const { nameGame, price, type, imageGame, Description } = req.body;
    try {
        const [result] = await conn.query(
            "INSERT INTO game (nameGame, price, type, imageGame, Description) VALUES (?, ?, ?, ?, ?)",
            [nameGame, price, type, imageGame, Description]
        );
        res.json({ message: "Game added successfully", id: (result as any).insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});




router.put("/:id", upload.single("imageGame"), async (req, res) => {
    const gameId = req.params.id;
    const { nameGame, price, type, Description } = req.body;

    try {
        // เช็คว่าเกมมีอยู่
        const [rows] = await conn.query("SELECT gid, imageGame FROM game WHERE gid = ?", [gameId]);
        const game = (rows as any[])[0];

        if (!game) {
            return res.status(404).json({ message: "ไม่พบเกม" });
        }

        // ถ้ามีไฟล์อัปโหลดใหม่
        const imageGame = req.file ? `/uploads/${req.file.filename}` : game.imageGame;

        // อัปเดตข้อมูลเกม
        await conn.query(
            "UPDATE game SET nameGame=?, price=?, type=?, Description=?, imageGame=? WHERE gid=?",
            [nameGame, price, type, Description, imageGame, gameId]
        );

        return res.status(200).json({
            message: "อัปเดตเกมสำเร็จ",
            imageUrl: imageGame ? `https://webbackend01.onrender.com${imageGame}` : null
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});



router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await conn.query("DELETE FROM game WHERE gid=?", [id]);
        res.json({ message: "Game deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});