import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ; 

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