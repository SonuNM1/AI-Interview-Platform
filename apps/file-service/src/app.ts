import express from "express" ;

const app = express() 

app.use(express.json()) ; 

app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true, 
        service: "File Service"
    })
})


export default app ; 