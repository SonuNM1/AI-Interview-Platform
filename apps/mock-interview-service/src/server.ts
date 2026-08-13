import "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";

// Starts the Mock Interview Service

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5008;

  app.listen(PORT, () => {
    console.log(
      `🎯 Mock Interview Service running on http://localhost:${PORT}`
    );
  });
};

startServer();