import { consumeEvent, UserEventType } from "@repo/shared-rabbitmq";

import { createOTP } from "../services/otp.service.js";
import { sendVerificationOTP } from "../services/email.service.js";

/* Consumes authentication-related events and handles OTP emails */

export const consumeUserEvents = async () => {
  await consumeEvent("user_events", "notification_queue", async (data) => {
    console.log("📩 Notification Service received user event:");
    console.log(data);

    if (data.type === UserEventType.USER_REGISTERED) {
      const otp = await createOTP(data.id);

      console.log("OTP generated for registration");

      await sendVerificationOTP(data.email, otp);

      return;
    }

    if (data.type === UserEventType.RESEND_OTP) {
      const otp = await createOTP(data.id, true);

      console.log("OTP generated for resend");

      await sendVerificationOTP(data.email, otp);

      return;
    }

    if (data.type === UserEventType.PASSWORD_RESET) {
      const otp = await createOTP(data.id);

      console.log("OTP generated for password reset");

      await sendVerificationOTP(data.email, otp);
    }

    if (data.type === UserEventType.ACCOUNT_DELETION_REQUESTED) {
      const otp = await createOTP(data.id, true);

      await sendVerificationOTP(data.email, otp);
    }
  });
};
