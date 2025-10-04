import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const ext = file.originalname.split(".").pop();
        const filename = `${uuidv4()}.${ext}`;
        cb(null, filename);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 64 * 1024 * 1024 } // 64MB
});
