import { Router } from "express";
import { createPayment, getPayments, verifyPaymentController } from "../controllers/payment.controller.js";

const router = Router() ; 

// creates a razorpay order 

router.get("/orders", createPayment) ; 

// verifies the razorpay checkout signature 

router.post("/verify", verifyPaymentController) ; 

// returns the candidate's payment history 

router.get("/history", getPayments) ; 

export default router 