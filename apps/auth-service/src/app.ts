import express from "express"
import authRoutes from "./routes/auth.routes.js"
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express() ; 

app.use(express.json()) ; // parse JSON request body 

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true, 
        service: "Auth Service", 
        message: "Server is running 🚀"
    })
})

// Auth routes 

app.use("/api/v1/auth", authRoutes)

// Global error handler 

app.use(errorHandler)

export default app ; 