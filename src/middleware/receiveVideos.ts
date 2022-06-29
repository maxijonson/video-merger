import multer from "multer";
import { UPLOADS_DIR, MAX_FILE_COUNT } from "../config/constants";

const receiveVideos = multer({
    dest: UPLOADS_DIR,
    fileFilter: (_req, file, cb) => {
        // Accept mp4 files only
        cb(null, file.mimetype === "video/mp4");
    },
    limits: {
        files: MAX_FILE_COUNT,
        fileSize: 1024 * 1024 * 100, // 100MB
    },
});

export default receiveVideos;
