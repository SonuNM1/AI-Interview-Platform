import dotenv from "dotenv" ; 
dotenv.config() 

import app from "./app.js" ; 
import mongoose from "mongoose" ; 
import {
  connectRabbitMQ,
} from "@repo/shared-rabbitmq";

const PORT = process.env.PORT || 5003 ; 

const start = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI!) ; 

        console.log("✅ MongoDB Connected") ; 

        await connectRabbitMQ() ; 

        console.log("✅ RabbitMQ Connected")

        app.listen(PORT, () => {
            console.log(`🚀 Interview Service running on http://localhost:${PORT}`) ; 
        })
    } catch (error) {
        console.error("Interview Service error: ", error) ; 
    }
}

start() ; 