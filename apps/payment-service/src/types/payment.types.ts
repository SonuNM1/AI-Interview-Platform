// payment types shared between controllers and services 

export interface CreatePaymentOrderInput {
    mentorId: string ; 
    mentorshipId?: string ; 
    amount: number 
}

export interface VerifyPaymentInput {
    razorpayOrderId: string ; 
    razorpayPaymentId: string ; 
    razorpaySignature: string 
}