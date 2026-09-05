import "./config/env.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async () => {
  await connectDB();

  app.listen(env.port, () => {
    console.log(
      `Payment Service running on http://localhost:${env.port}`,
    );
  });
};

startServer().catch((error) => {
  console.error(
    "❌ Failed to start Payment Service:",
    error,
  );

  process.exit(1);
});