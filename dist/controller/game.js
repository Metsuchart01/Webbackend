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
exports.router.get("", async (req, res) => {
    try {
        const [rows] = await dbConnecDatabase_1.conn.query(`
            SELECT *
            FROM game 
        `);
        const games = rows.map(game => ({
            gid: game.gid,
            NameGame: game.nameGame,
            price: game.price,
            type: game.type,
            imageGame: game.imageGame ? `https://webbackend01.onrender.com${game.imageGame}` : null,
            Description: game.Description,
        }));
        res.status(200).json({
            status: 200, games
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.router.get("/:id", async (req, res) => {
    const gameId = req.params.id;
    try {
        const [rows] = await dbConnecDatabase_1.conn.query(`
            SELECT *
            FROM game
            where gid = ? 
        `, [gameId]);
        const game = rows[0];
        const imageGameUrl = game.imageGame ? `https://webbackend01.onrender.com${game.imageGame}` : null;
        res.status(200).json({
            status: 200,
            games: {
                gid: game.gid,
                NameGame: game.nameGame,
                price: game.price,
                type: game.type,
                imageGame: imageGameUrl,
                Description: game.Description,
                create_at: game.create_at
            }
        }); // ต้องส่ง response กลับ client
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.router.get("/game/rank", async (req, res) => {
    try {
        const [rows] = await dbConnecDatabase_1.conn.query(`
            SELECT g.gid, g.nameGame, g.price, g.type, g.imageGame, g.Description,
                   COALESCE(SUM(s.quantity),0) AS total_sales
            FROM game g
            LEFT JOIN sales s ON g.gid = s.game_id
            GROUP BY g.gid, g.nameGame, g.price, g.type, g.imageGame, g.Description
            ORDER BY total_sales DESC
            LIMIT 5;
            
        `);
        const games = rows.map((game, index) => ({
            rank: index + 1,
            gid: game.gid,
            nameGame: game.nameGame,
            price: game.price,
            type: game.type,
            imageGame: game.imageGame ? `https://webbackend01.onrender.com${game.imageGame}` : null,
            Description: game.Description,
            total_sales: game.total_sales
        }));
        res.status(200).json({
            status: 200,
            games
        }); // ต้องส่ง response กลับ client
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.router.post("/add", upload_1.upload.single("imageGame"), async (req, res) => {
    const { nameGame, price, type, Description } = req.body;
    const imageGame = req.file ? `/uploads/imageGame/${req.file.filename}` : null;
    try {
        const [result] = await dbConnecDatabase_1.conn.query("INSERT INTO game (nameGame, price, type, imageGame, Description) VALUES (?, ?, ?, ?, ?)", [nameGame, price, type, imageGame, Description]);
        res.json({ message: "Game added successfully", id: result.insertId });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
exports.router.put("/:id", upload_1.upload.single("imageGame"), async (req, res) => {
    const gameId = req.params.id;
    const { nameGame, price, type, Description } = req.body;
    try {
        // เช็คว่าเกมมีอยู่
        const [rows] = await dbConnecDatabase_1.conn.query("SELECT gid, imageGame FROM game WHERE gid = ?", [gameId]);
        const game = rows[0];
        if (!game) {
            return res.status(404).json({ message: "ไม่พบเกม" });
        }
        // ถ้ามีไฟล์อัปโหลดใหม่
        const imageGame = req.file ? `/uploads/imageGame/${req.file.filename}` : game.imageGame;
        // อัปเดตข้อมูลเกม
        await dbConnecDatabase_1.conn.query("UPDATE game SET nameGame=?, price=?, type=?, Description=?, imageGame=? WHERE gid=?", [nameGame, price, type, Description, imageGame, gameId]);
        return res.status(200).json({
            message: "อัปเดตเกมสำเร็จ",
            imageGame: imageGame ? `https://webbackend01.onrender.com${imageGame}` : null
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "เกิดข้อผิดพลาด", error });
    }
});
exports.router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await dbConnecDatabase_1.conn.query("DELETE FROM game WHERE gid=?", [id]);
        res.json({ message: "Game deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});
//# sourceMappingURL=game.js.map