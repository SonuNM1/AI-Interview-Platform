import Razorpay from "razorpay";

// creates the Razorpay SDK Client using server-side credentials. The secret must never be exposed to the frontend 

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!, 
    key_secret: process.env.RAZORPAY_KEY_SECRET!
}) ; 

export default razorpay ; 