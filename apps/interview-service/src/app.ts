import express from "express" ;
import interviewRoutes from "./routes/interview.route.js" ;

const app = express() 

app.use(express.json()) ; 

app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true, 
        service: "Interview Service"
    })
})

app.use("/api/v1/interviews", interviewRoutes) ;

export default app ; 