import { getRedis } from "@repo/shared-redis";
import { generateOTP } from "../utils/otp.js";

const OTP_EXPIRY_SECONDS = 300;

export const createOTP = async (
  userId: string,
  isResend = false,
): Promise<string> => {
  const redis = getRedis();

  const existingOTP = await redis.get(`otp:${userId}`);

  let resendCount = 0;

  if (existingOTP) {
    const parsedOTP = JSON.parse(existingOTP);

    resendCount = parsedOTP.resendCount;

    if (isResend) {
      resendCount++;
    }
  }

  const otp = generateOTP();

  const otpData = {
    otp,
    attempts: 0,
    resendCount,
    createdAt: Date.now(),
  };

  console.log("Saving OTP for:", userId);
  console.log(otpData);

  await redis.set(
    `otp:${userId}`,
    JSON.stringify(otpData),
    "EX",
    OTP_EXPIRY_SECONDS,
  );

  console.log("OTP Saved In Redis");

  return otp;
};
