import express from "express" ;
import interviewRoutes from "./routes/interview.route.js" ;
import publicInterviewRoutes from "./routes/publicInterview.routes.js";
import interviewQuestionRoutes from "./routes/interviewQuestion.routes.js";

const app = express() 

app.use(express.json()) ; 

app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true, 
        service: "Interview Service"
    })
})

app.use("/api/v1/interviews", interviewRoutes) ;

app.use("/api/v1/public/interviews", publicInterviewRoutes);

app.use("/api/v1/public/interviews", interviewQuestionRoutes) ; 

export default app ; 