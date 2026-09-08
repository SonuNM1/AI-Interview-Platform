import { Router } from "express";

import {
  createMentorshipSubscriptionController,
  verifyMentorshipSubscriptionPaymentController,
} from "../controllers/subscription.controller.js";

const router = Router();

// Creates a Razorpay monthly mentorship subscription.
 
router.post( "/mentorship",
  createMentorshipSubscriptionController,
);

// verifies the razorpay subscription checkout response 

router.post("/mentorship/verify", verifyMentorshipSubscriptionPaymentController)

export default router; 