import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

console.log(
  "OPENAI KEY:",
  process.env.OPENAI_API_KEY?.slice(0, 10),
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default openai;