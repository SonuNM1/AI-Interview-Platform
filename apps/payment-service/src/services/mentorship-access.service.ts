import { publishEvent, MentorshipEventType } from "@repo/shared-rabbitmq";

// Publishes an event when a candidate gains access to a mentor through a successful subscription. Chat service consumes this event and stores the candidate <-> mentor access relationship

export const publishMentorshipAccessGranted = async (payment: {
  _id: unknown;
  userId: string;
  mentorId?: string;
  mentorshipId?: string;
  amount: number;
  currency: string;
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  currentEnd?: Date;
}) => {
  if (!payment.mentorId) {
    throw new Error("Cannot grant mentorship access without mentorId");
  }

  await publishEvent("mentorship.events", {
    type: MentorshipEventType.MENTORSHIP_ACCESS_GRANTED,

    data: {
      paymentId: String(payment._id),

      candidateId: payment.userId,

      mentorId: payment.mentorId,

      mentorshipId: payment.mentorshipId ?? null,

      amount: payment.amount,

      currency: payment.currency,

      razorpayPaymentId: payment.razorpayPaymentId,

      razorpaySubscriptionId: payment.razorpaySubscriptionId,

      expiresAt: payment.currentEnd
        ? payment.currentEnd.toISOString()
        : undefined,
    },

    occurredAt: new Date().toISOString(),
  });
};

// Publishes an event when a mentorship subscription is halted, cancelled, or completed. Chat Service consumes this and revokes active chat access.

export const publishMentorshipAccessRevoked = async (
  razorpaySubscriptionId: string,
) => {
  await publishEvent("mentorship.events", {
    type: MentorshipEventType.MENTORSHIP_ACCESS_REVOKED,

    data: {
      razorpaySubscriptionId,
    },

    occurredAt: new Date().toISOString(),
  });
};