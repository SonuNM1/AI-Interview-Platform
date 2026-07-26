import dotenv from "dotenv";
dotenv.config({
    override: true
});
import {
    connectRabbitMQ, 
    consumeEvent
} from "@repo/shared-rabbitmq"
import { createUserProfile } from "./services/user.service.js";

import app from "./app.js";

const PORT = process.env.PORT || 5001;

const startServer = async () => {
    try {
        await connectRabbitMQ();

        await consumeEvent(
            "user_events", 
            "user_profile_queue", 
            async (data) => {
                console.log("📩 Received:", data) ; 

                await createUserProfile({
                    id: data.id, 
                    email: data.email
                }) ; 

                console.log("✅ Profile created") ; 
            }
        )

        app.listen(PORT, () => {
            console.log(`User Service running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("User Service error: ", error);
    }
};

startServer();