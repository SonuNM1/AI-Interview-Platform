import express, {Express} from "express"
import authRoutes from "./routes/auth.routes.js"

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

export default app ; 