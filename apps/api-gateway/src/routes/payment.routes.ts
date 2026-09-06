import { Router } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { services } from "../config/services.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router() ; 

const paymentProxy = createProxyMiddleware({
    target: services.payment, 
    changeOrigin:true, 
    pathRewrite: (path) => `/api/v1/payments${path}`
})

// create a razorpay order 

router.post("/create-order", authenticate, paymentProxy) ; 

// verify the payment returned by razorpay checkout 

router.post("/verify", authenticate, paymentProxy) ; 

// receive payment events directly from Razorpay 

router.post("/webhook", paymentProxy) ; 

export default router ; 