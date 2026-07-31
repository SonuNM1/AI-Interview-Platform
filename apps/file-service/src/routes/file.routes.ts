import { Router } from "express";
import upload from "../config/multer.config.js";
import { deleteFileController, getFileByIdController, getSignedUrlController, uploadFileController } from "../controllers/file.controller.js";

const router = Router() ; 

// uploading a single file 

router.post("/upload", upload.single("file"), uploadFileController) ; // file means the frontend must send form-data file: resume.pdf - the key must be named 'file'

router.delete("/:id",deleteFileController);

router.get("/signed-url/:id", getSignedUrlController);

router.get("/:id", getFileByIdController);

export default router ; 