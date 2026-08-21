import { Router } from "express";
import upload from "../config/multer.config.js";
import { deleteFileController, getFileByIdController, getSignedUrlController, uploadFileController } from "../controllers/file.controller.js";

const router: Router = Router() ; 

// uploading a single file 

router.post("/upload", upload.single("file"), uploadFileController) ; 

router.delete("/:id",deleteFileController);

router.get("/signed-url/:id", getSignedUrlController);

router.get("/:id", getFileByIdController);

export default router ; 