import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";

const router = Router();

const publicInterviewProxy = createProxyMiddleware({
  target: services.interview,
  changeOrigin: true,
  pathRewrite: (path) => `/api/v1/public/interviews${path}`,
});

router.get("/:accessToken", publicInterviewProxy);

router.post("/:accessToken/start", publicInterviewProxy);

router.post("/:accessToken/start-question", publicInterviewProxy);

router.post("/:accessToken/questions/answer", publicInterviewProxy);

router.post("/:accessToken/questions/next", publicInterviewProxy);

router.post("/:accessToken/submit", publicInterviewProxy);

router.get("/interview-report/:accessToken", publicInterviewProxy);

export default router;