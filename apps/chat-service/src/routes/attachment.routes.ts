import { Router } from "express";

import upload from "../config/multer.config.js";
import { uploadAttachment,getAttachmentSignedUrl } from "../controllers/attachment.controller.js";

const router: Router = Router();

// uploading chat attachment 

router.post("/upload", upload.single("file"), uploadAttachment);

router.get("/signed-url/:fileId", getAttachmentSignedUrl);

export default router;