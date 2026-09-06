import { Router } from "express";

import {
  createMentorshipSubscriptionController,
} from "../controllers/subscription.controller.js";

const router = Router();

// Creates a Razorpay monthly mentorship subscription.
 
router.post( "/mentorship",
  createMentorshipSubscriptionController,
);

export default router;