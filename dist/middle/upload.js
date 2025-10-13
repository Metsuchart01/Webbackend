"use strict";
// // middle/upload.ts
// import multer from "multer";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";
// import fs from "fs";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
// const uploadsDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
// export const upload = multer({
//     storage: multer.diskStorage({
//         destination: (_req, _file, cb) => cb(null, uploadsDir),
//         filename: (_req, file, cb) => {
//             const ext = path.extname(file.originalname);
//             cb(null, uuidv4() + ext);
//         }
//     }),
//     limits: { fileSize: 64 * 1024 * 1024 }
// });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
exports.upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            let subfolder = "others";
            if (file.fieldname === "imageGame")
                subfolder = "imageGame";
            else if (file.fieldname === "imageProfile")
                subfolder = "imageProfile";
            const targetPath = path_1.default.join(__dirname, "../uploads", subfolder);
            // ✅ ถ้ายังไม่มีโฟลเดอร์ ให้สร้างใหม่
            if (!fs_1.default.existsSync(targetPath)) {
                fs_1.default.mkdirSync(targetPath, { recursive: true });
            }
            cb(null, targetPath);
        },
        filename: (_req, file, cb) => {
            const ext = path_1.default.extname(file.originalname);
            cb(null, (0, uuid_1.v4)() + ext);
        }
    }),
    limits: { fileSize: 64 * 1024 * 1024 }
});
//# sourceMappingURL=upload.js.map