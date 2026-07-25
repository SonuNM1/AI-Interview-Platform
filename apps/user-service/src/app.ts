import express from "express"
import userRoutes from "./routes/user.routes.js"

const app = express()

app.use(express.json())

// health route 

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true, 
        service: "User Service", 
        message: "Server is running 🚀"
    })
})

console.log("Registering user routes...")

app.use("/api/v1/users", userRoutes) ; 

export default app ; 