import dotenv from "dotenv";
dotenv.config();

console.log("================================");
console.log("THIS IS USER SERVICE");
console.log("Current directory:", process.cwd());
console.log("PORT =", process.env.PORT);
console.log("================================");

import app from "./app.js";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`User Service running on http://localhost:${PORT}`);
});