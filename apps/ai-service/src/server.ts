import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5006;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🤖 AI Service running on http://localhost:${PORT}`);
  });
};

startServer();