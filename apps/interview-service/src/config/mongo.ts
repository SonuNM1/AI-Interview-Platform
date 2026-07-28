import mongoose from "mongoose" ; 

// connect to mongodb 

export const connectMongoDB = async () => {
    try {
        await mongoose.connect(
            process.env.MONGODB_URI!
        ) ; 

        console.log("✅ MongoDB Connected") ; 
    } catch (error) {
        console.error("MongoDB Connection error: ", error) ; 

        process.exit(1) ; // it immediately stops the Node.js application because a critical startup setup (like database connection) failed. Without it, the server may continue running in a broken state, accepting requests even though it can't access the database. 
    }
}