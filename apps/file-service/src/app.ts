import express from "express" ;
import fileRoutes from "./routes/file.routes.js"

const app: express.Express = express() 

app.use(express.json()) ; 

app.get("/health", (_req, res) => {
    res.status(200).json({
        success: true, 
        service: "File Service"
    })
})

// registering the route 

app.use("/api/v1/files", fileRoutes);

export default app ; 