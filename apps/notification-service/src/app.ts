import express from "express"
import notificationRoutes from "./routes/notification.routes.js";

const app: express.Express = express() ;

app.use(express.json())

// Notification API routes.

app.use("/api/v1/notifications", notificationRoutes);

// health check 

app.get("/health", (req, res) => {
    res.json({
        success: true, 
        service: "Notification service"
    })
})

export default app ; 