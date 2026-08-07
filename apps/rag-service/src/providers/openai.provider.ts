import "../config/env.js";
import OpenAI from "openai";

// Creates an OpenAI client for generating embeddings.

console.log(
  "OPENAI KEY:",
  process.env.OPENAI_API_KEY?.slice(0, 10)
);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default client;