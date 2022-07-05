import multer from "multer";
import { DIR_UPLOADS } from "../config/constants";
import ConfigService from "../services/ConfigService/ConfigService";

const config = ConfigService.getConfig();

const upload = multer({
    dest: DIR_UPLOADS,
    fileFilter: (_req, file, cb) => {
        // Accept mp4 files only
        cb(null, file.mimetype === "video/mp4");
    },
    limits: {
        files: config.maxFileUploadCount,
        fileSize: config.maxFileUploadSize,
        fields: 1,
    },
});

export default upload;
