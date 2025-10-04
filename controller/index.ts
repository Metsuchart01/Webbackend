import express from "express";
import { conn } from "../dbConnecDatabase";


export const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hello, this is the index route!");
});

