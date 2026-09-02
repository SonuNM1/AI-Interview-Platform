import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

const authProxy = createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  
  pathRewrite: (path) => `/api/v1/auth${path}`,
});

// Logout requires authentication

router.post("/logout", authenticate, authProxy);

router.post("/delete-account/request", authenticate, authProxy);

router.post("/delete-account/verify", authenticate, authProxy);

router.use("/", authProxy);

export default router;