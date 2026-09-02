import { consumeEvent, InterviewEventType } from "@repo/shared-rabbitmq";

import { createNotification } from "../services/notification.service.js";

import { NotificationType } from "../models/notification.model.js";

// Consumes interview events and converts them into persistent user notifications

export const startInterviewNotificationConsumer = async () => {
  await consumeEvent(
    "interview_events",
    "interview_notification_queue",
    async (data) => {
      console.log("📩 Interview notification event received:", data);

      if (data.type === InterviewEventType.INTERVIEW_SCHEDULED) {
        await createNotification({
          userId: data.candidateId,
          type: NotificationType.INTERVIEW_SCHEDULED,
          title: "Interview Scheduled",
          message: `Your ${data.title} interview has been scheduled.`,
          metadata: {
            interviewId: data.interviewId,
            scheduledAt: data.scheduledAt,
            role: data.role,
          },
        });

        return;
      }

      if (data.type === InterviewEventType.INTERVIEW_UPDATED) {
        const wasRescheduled =
          data.previousScheduledAt &&
          data.scheduledAt &&
          new Date(data.previousScheduledAt).getTime() !==
            new Date(data.scheduledAt).getTime();

        if (wasRescheduled) {
          await createNotification({
            userId: data.candidateId,
            type: NotificationType.INTERVIEW_RESCHEDULED,
            title: "Interview Rescheduled",
            message: `Your ${data.role} interview has been rescheduled.`,
            metadata: {
              interviewId: data.interviewId,
              scheduledAt: data.scheduledAt,
              previousScheduledAt: data.previousScheduledAt,
              role: data.role,
            },
          });

          return;
        }

        await createNotification({
          userId: data.candidateId,
          type: NotificationType.INTERVIEW_UPDATED,
          title: "Interview Updated",
          message: `Your ${data.role} interview details have been updated.`,
          metadata: {
            interviewId: data.interviewId,
            scheduledAt: data.scheduledAt,
            role: data.role,
          },
        });

        return;
      }

      if (data.type === InterviewEventType.INTERVIEW_COMPLETED) {
        await createNotification({
          // The recruiter who created the interview receives this notification.
          userId: data.recruiterId,
          type: NotificationType.INTERVIEW_COMPLETED,
          title: "Interview Completed",
          message: `A candidate has completed the ${data.role} interview.`,
          metadata: {
            interviewId: data.interviewId,
            role: data.role,
          },
        });
      }
    },
  );
};
