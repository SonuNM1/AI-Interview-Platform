import app from "./app.js";
import dotenv from "dotenv"
dotenv.config({
    override: true 
})
import {connectRabbitMQ} from "@repo/shared-rabbitmq" ; 

console.log("PORT from env:", process.env.PORT);

const PORT = process.env.PORT || 5000 ; 

const startServer = async () => {
    try {
        await connectRabbitMQ() ; 

        console.log("=========== AUTH SERVICE ==========") ;

        app.listen(PORT, ()=> {
            console.log(`Auth Service running on http://localhost:${PORT}`)
        })
    } catch (error) {
        console.error("Auth Service Error: ", error)
    }
}

startServer() ; 