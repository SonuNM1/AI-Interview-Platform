import { getRedis } from "@repo/shared-redis";
import { generateOTP } from "../utils/otp.js";

const OTP_EXPIRY_SECONDS = 300 ; 

export const createOTP = async (
    userId: string 
): Promise<string> => {
    const redis = getRedis() ; 
    const otp = generateOTP() ;
    
    const otpData = {
        otp, 
        attempts: 0, 
        resendCount: 0, 
        createdAt: Date.now()
    }

    await redis.set(
        `otp:${userId}`, 
        JSON.stringify(otpData), 
        "EX", 
        OTP_EXPIRY_SECONDS
    ) ; 

    return otp; 
}