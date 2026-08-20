import express from "express"

const app: express.Express = express() ;

app.use(express.json())

// health check 

app.get("/health", (req, res) => {
    res.json({
        success: true, 
        service: "Notification service"
    })
})

export default app ; 