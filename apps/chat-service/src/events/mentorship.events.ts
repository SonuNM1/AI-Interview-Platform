import {
  consumeEvent,
} from "@repo/shared-rabbitmq";
import {
  MentorshipEventType,
} from "@repo/shared-rabbitmq";
import {
  grantMentorshipAccess,
  revokeMentorshipAccess,
} from "../services/mentorship-access.service.js";

// registers RabbitMQ consumers for mentorship events. Payment service publishes these events. Chat Service consumes them and maintains its local authorization projection 

export const registerMentorshipEventConsumers =
  async () => {
    await consumeEvent(
      "mentorship.events",
      "chat-service.mentorship-access",
      async (event) => {
        if (!event?.type) {
          return;
        }

        // Access Granted 

        if (
          event.type ===
          MentorshipEventType.MENTORSHIP_ACCESS_GRANTED
        ) {
          const data = event.data;

          if (
            !data?.candidateId ||
            !data?.mentorId ||
            !data?.razorpaySubscriptionId
          ) {
            console.error(
              "Invalid MENTORSHIP_ACCESS_GRANTED event:",
              event,
            );

            return;
          }

          await grantMentorshipAccess({
            candidateId:
              data.candidateId,

            mentorId:
              data.mentorId,

            razorpaySubscriptionId:
              data.razorpaySubscriptionId,

            expiresAt:
              data.expiresAt
                ? new Date(data.expiresAt)
                : undefined,
          });

          console.log(
            `✅ Mentorship access granted: ${data.candidateId} -> ${data.mentorId}`,
          );

          return;
        }

        // Access Revoked 

        if (
          event.type ===
          MentorshipEventType.MENTORSHIP_ACCESS_REVOKED
        ) {
          const subscriptionId =
            event.data?.razorpaySubscriptionId;

          if (!subscriptionId) {
            return;
          }

          await revokeMentorshipAccess(
            subscriptionId,
          );

          console.log(
            `🔒 Mentorship access revoked: ${subscriptionId}`,
          );
        }
      },
    );
  };