import axios from "axios";
import api from "./api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ; 

export interface CreateMentorshipSubscriptionResponse {
  subscriptionId: string;
  razorpaySubscriptionId: string;
  razorpayPlanId: string;
  amount: number;
  currency: string;
  keyId: string;
}

// Creates a razorpay order on the backend 

export const createPaymentOrder = async (
    mentorId: string, 
    mentorshipId?: string 
) => {
    const response = await axios.post(
        `${API_BASE_URL}/api/v1/payments/orders`, 
        {
            mentorId, 
            mentorshipId, 
            amount: 999 
        }
    )

    return response.data ; 
}

// sends the razorpay checkout response to the backend for server-side verification 

export const verifyPayment = async (
    data: {
         razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    }
) => {
    const response = await axios.post(
        `${API_BASE_URL}/api/v1/payments/verify`, 
        data 
    ) ; 

    return response.data ; 
}

// Creates a monthly Razorpay mentorship subscription

export const createMentorshipSubscription = async (
  mentorId: string,
) => {
  const response = await api.post(
    "/payments/subscription/mentorship",
    {
      mentorId,
    },
  );

  return response.data;
};

// verifies the razorpay subscription checkout response on the server 

export const verifyMentorshipSubscriptionPayment = async (
  data: {
    razorpaySubscriptionId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }
) => {
  const response = await api.post(
    "/payments/subscription/mentorship/verify", 
    data 
  ) ; 

  return response.data ; 
}