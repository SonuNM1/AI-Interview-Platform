// Connect to RabbitMQ -> Create Channel -> Export Connection -> Export Channel

import amqp from "amqplib"
import type { Channel, ChannelModel } from "amqplib";

let connection: ChannelModel; 
let channel: Channel; 

// Connect to RabbitMQ 

export const connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(
            process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672", 
            {
                heartbeat: 60
            }
        ) ; 

        connection.on("error", (error) => {
            console.error("❌ RabbitMQ connection error: ", error) ; 
        })

        connection.on("close", () => {
            console.error("❌ RabbitMQ connection closed.")
        })

        channel = await connection.createChannel() ; 

        console.log("✅ Connected to RabbitMQ")
    } catch (error) {
        console.error("❌ RabbitMQ Connection Error:", error);

        process.exit(1);
    }
}

// Get RabbitMQ Channel 

export const getChannel = () => {
    if(!channel) {
        throw new Error("RabbitMQ Channel not initialized") ; 
    }

    return channel ;  
}