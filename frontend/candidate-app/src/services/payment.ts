import {
  createPaymentOrder,
  verifyPayment,
} from "./payment.api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const handleMentorshipPayment = async (
  mentorId: string,
  mentorshipId?: string,
) => {
  const result = await createPaymentOrder(
    mentorId,
    mentorshipId,
  );
  const {
    orderId,
    amount,
    currency,
    keyId,
  } = result.data;
  const razorpay = new window.Razorpay({
    key: keyId,
    amount,
    currency,
    order_id: orderId,
    handler: async (response: any) => {
      await verifyPayment({
        razorpay_order_id:
          response.razorpay_order_id,

        razorpay_payment_id:
          response.razorpay_payment_id,
        razorpay_signature:
          response.razorpay_signature,
      });
    },
  });
  razorpay.open();
};