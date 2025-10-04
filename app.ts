import cor from "cors";
import express from "express";
import { router as register } from "./controller/register";
import { router as login } from "./controller/login";
import { router as index } from "./controller/index";
import { router as user } from "./controller/user";
import path from "path";


export const app = express();
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/", index);
app.use("/user", user);
app.use("/register", register);
app.use("/login", login);
