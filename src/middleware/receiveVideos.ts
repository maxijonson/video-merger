import multer from "multer";
import { UPLOADS_DIR } from "../config/constants";
import ConfigService from "../services/ConfigService/ConfigService";

const config = ConfigService.instance.getConfig();

const receiveVideos = multer({
    dest: UPLOADS_DIR,
    fileFilter: (_req, file, cb) => {
        // Accept mp4 files only
        cb(null, file.mimetype === "video/mp4");
    },
    limits: {
        files: config.maxFileUploadCount,
        fileSize: config.maxFileUploadSize,
    },
});

export default receiveVideos;
