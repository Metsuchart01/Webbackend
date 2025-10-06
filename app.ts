import cor from "cors";
import express from "express";
import { router as register } from "./controller/register";
import { router as login } from "./controller/login";
import { router as index } from "./controller/index";
import { router as user } from "./controller/user";
import { router as updateuser } from "./controller/updateuser";
import path from "path";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { jwtAuthen } from "./middle/jwtAuth";

export const app = express();
app.use(express.json());
app.use(cor());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", index);
app.use("/register", register);
app.use("/login", login);

app.use(jwtAuthen); // ตรวจสอบ JWT ก่อนเข้าถึง route ที่ไม่ได้ยกเว้น

app.use("/user", user);
app.use("/updateuser", updateuser);
