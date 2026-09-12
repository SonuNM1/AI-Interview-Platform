import {
  consumeEvent,
  MentorshipEventType,
} from "@repo/shared-rabbitmq";

import { createNotification } from "../services/notification.service.js";
import { NotificationType } from "../models/notification.model.js";

/* Converts successful mentorship access events into mentor notifications */

export const startMentorshipNotificationConsumer = async () => {
  await consumeEvent(
    "mentorship.events",
    "notification-service.mentorship-access",
    async (event) => {
      console.log(
        "📩 Mentorship notification event received:",
        event,
      );

      if (
        event.type !==
        MentorshipEventType.MENTORSHIP_ACCESS_GRANTED
      ) {
        return;
      }

      const data = event.data ; 

      if(!data?.mentorId) {
        console.error("Invalid MENTORSHIP_ACCESS_GRANTED notification event: ", event) ; 
        return ; 
      }

      await createNotification({
        userId: data.mentorId,
        type: NotificationType.MENTORSHIP_PURCHASED,
        title: "New Mentorship Subscription",
        message: "A candidate purchased your mentorship.",
        metadata: {
          role: "MENTOR",
        },
      });
    },
  );
};