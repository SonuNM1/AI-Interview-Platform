import {
  createPaymentOrder,
  verifyPayment,
} from "./payment.api";

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

  if (!window.Razorpay) {
    throw new Error("Razorpay SDK is not loaded");
  }

  const razorpay = new window.Razorpay({
    key: keyId,
    amount,
    currency,
    order_id: orderId,
    handler: async (response) => {
      await verifyPayment({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });
    },
  });

  razorpay.open();
};