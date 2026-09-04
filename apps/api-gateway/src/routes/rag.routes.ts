import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router: Router = Router();

/**
 * Proxies Mock Interview resume uploads to the RAG Service.
 */
const ragUploadProxy = createProxyMiddleware({
  target: services.rag,
  changeOrigin: true,

  // /documents/upload is already part of the RAG route.
  // Only /api/v1 needs to be added.
  pathRewrite: (path) => `/api/v1${path}`,
});

/**
 * Proxies requests for an existing RAG document.
 */
const ragDocumentProxy = createProxyMiddleware({
  target: services.rag,
  changeOrigin: true,

  // This route is mounted under /api/v1/documents in RAG Service.
  pathRewrite: (path) => `/api/v1/documents${path}`,
});

// Upload a resume specifically for Mock Interview RAG processing.
router.post(
  "/documents/upload",
  authenticate,
  authorize("CANDIDATE"),
  ragUploadProxy,
);

// Returns the RAG document associated with the candidate's profile resume.
router.get(
  "/document/resume/:fileId",
  authenticate,
  authorize("CANDIDATE"),
  ragDocumentProxy,
);

export default router;