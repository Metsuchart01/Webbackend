// // middle/upload.ts
// import multer from "multer";
// import path from "path";
// import { v4 as uuidv4 } from "uuid";
// import fs from "fs";

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

import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

export const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            let subfolder = "others";
            if (file.fieldname === "imageGame") subfolder = "imageGame";
            else if (file.fieldname === "imageProfile") subfolder = "imageProfile";

            const targetPath = path.join(__dirname, "../uploads", subfolder);

            // ✅ ถ้ายังไม่มีโฟลเดอร์ ให้สร้างใหม่
            if (!fs.existsSync(targetPath)) {
                fs.mkdirSync(targetPath, { recursive: true });
            }

            cb(null, targetPath);
        },
        filename: (_req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, uuidv4() + ext);
        }
    }),
    limits: { fileSize: 64 * 1024 * 1024 }
});
