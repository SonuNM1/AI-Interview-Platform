import dotenv from "dotenv" ; 
dotenv.config() 

import app from "./app.js" ; 
import mongoose from "mongoose" ; 

const PORT = process.env.PORT || 5003 ; 

const start = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URI!) ; 

        console.log("✅ MongoDB Connected") ; 

        app.listen(PORT, () => {
            console.log(`🚀 File Service running on http://localhost:${PORT}`) ; 
        })
    } catch (error) {
        console.error("File Service error: ", error) ; 
    }
}

start() ; 