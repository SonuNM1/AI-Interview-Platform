import OpenAI from "openai";
import { toFile } from "openai/uploads.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const transcribeCandidateAudio = async (
  audioBuffer: Buffer,
  filename: string,
  mimetype: string,
): Promise<string> => {
  const audioFile = await toFile(
    audioBuffer,
    filename,
    {
      type: mimetype,
    },
  );

  const transcription =
    await client.audio.transcriptions.create({
      file: audioFile,
      model: "gpt-4o-mini-transcribe",
      language: "en",
      response_format: "json",
    });

  return transcription.text.trim();
};