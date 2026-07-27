import dotenv from "dotenv"
dotenv.config() ; 

import app from "./app.js"
import { connectRabbitMQ, consumeEvent } from "@repo/shared-rabbitmq";
import { connectRedis } from "@repo/shared-redis";
import { sendVerificationOTP } from "./services/email.service.js";
import { createOTP } from "./services/otp.service.js";
import { UserEventType } from "@repo/shared-rabbitmq";

console.log("Current Directory:", process.cwd());

const PORT = process.env.PORT || 5002;

const startServer = async () => {
    try {
        await connectRedis() ; 
        await connectRabbitMQ() ; 

        await consumeEvent(
            "user_events", 
            "notification_queue", 
            async (data) => {
                console.log("📩 Notification Service received:") ;
                
                console.log(data) ; 

                if(data.type === UserEventType.USER_REGISTERED) {
                    const otp = await createOTP(data.id) ; 

                    console.log("OTP Generated: ", otp) ; 

                    await sendVerificationOTP(
                        data.email, 
                        otp 
                    ) ;
                } else if (data.type === UserEventType.RESEND_OTP) {
                    const otp = await createOTP(data.id, true )

                    console.log("Resend OTP: ", otp) ; 

                    await sendVerificationOTP(
                        data.email, 
                        otp
                    )

                } else if(data.type === UserEventType.PASSWORD_RESET) {
                    const otp = await createOTP(data.id) ; 

                    console.log("Password Reset OTP: ", otp) ; 

                    await sendVerificationOTP(
                        data.email, 
                        otp    
                    )
                }
            }
        )

        app.listen(PORT, ()=> {
            console.log(
                `Notification Service running on http://localhost:${PORT}`
            )
        })

    } catch (error) {
        console.error(error) ; 
    }
}

startServer() ; 