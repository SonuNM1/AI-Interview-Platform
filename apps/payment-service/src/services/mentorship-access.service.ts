// publishes a successful mentorship payment event. Chat service consumes this event and grants the candidate access to the mentor conversation 

export const publishMentorshipAccessGranted = async (
    payment: {
        _id: unknown; 
        userId: string ; 
        mentorId?: string ; 
        mentorshipId?: string ; 
        amount: number ; 
        currency: string ; 
        razorpayOrderId: string ; 
        razorpayPaymentId: string 
    }
) => {
    
}