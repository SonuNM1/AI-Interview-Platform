import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router() ; 

const fileProxy = createProxyMiddleware({
    target: services.file, 
    changeOrigin: true, 
    pathRewrite: (path) => `/api/v1/files${path}`
})

// upload file 

router.post("/upload", authenticate, authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"), fileProxy) ; 

// Generate signed URL 

router.get("/signed-url/:id", authenticate, authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"), fileProxy) ; 

// get file metadata 

router.get("/:id", authenticate, authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"), fileProxy)

// Delete file

router.delete(
  "/:id",
  authenticate,
  authorize("CANDIDATE", "RECRUITER", "MENTOR", "ADMIN"),
  fileProxy,
);

export default router;