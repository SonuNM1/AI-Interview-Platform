import { sendInterviewReminderEmail } from "./email.service.js";

export const sendInterviewReminder = async (
  email: string,
  interviewTitle: string,
  scheduledAt: Date,
  duration: number,
) => {
  await sendInterviewReminderEmail(
    email,
    interviewTitle,
    scheduledAt,
    duration,
  );
};