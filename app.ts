import cor from "cors";
import express from "express";
import { router as register } from "./controller/register";
import { router as login } from "./controller/login";
import { router as index } from "./controller/index";

export const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/", index);
//app.use("/users", users);
app.use("/register", register);
app.use("/login", login);
