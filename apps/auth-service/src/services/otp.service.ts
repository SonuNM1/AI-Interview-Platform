import {getRedis} from "@repo/shared-redis" ; 

// Get OTP details stored in Redis 

export const getOTP = async (userId: string) => {
    const redis = getRedis() ; 

    const otpData = await redis.get(`otp:${userId}`) ; 

    if(!otpData) {
        return null ; 
    }

    return JSON.parse(otpData) ; 
}

// Delete OTP after successful verification 

export const deleteOTP = async (userId: string) => {
    const redis = getRedis() ; 

    await redis.del(`otp:${userId}`)
}