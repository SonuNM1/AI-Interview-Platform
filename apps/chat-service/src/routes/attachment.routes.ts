import { Router } from "express";

import upload from "../config/multer.config.js";
import { uploadAttachment } from "../controllers/attachment.controller.js";

const router = Router();

// uploading chat attachment 

router.post("/upload", upload.single("file"), uploadAttachment);

export default router;