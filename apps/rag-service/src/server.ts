import "./config/env.js";

import app from "./app.js";
import { connectDB } from "./config/db.js";

// Starts the RAG Service after establishing the database connection.

console.log(process.env.OPENAI_API_KEY?.slice(0, 10));

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5007;

  app.listen(PORT, () => {
    console.log(`📚 RAG Service running on http://localhost:${PORT}`);
  });
};

startServer();