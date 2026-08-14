import OpenAI from "openai";
import { toFile } from "openai/uploads.js";

// creating the OpenAI client using the API key loaded from env variables

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// converts the received audio buffer into a format accepted by OpenAI and sends it to the speech-to-text model

export const transcribeAudio = async (
  audioBuffer: Buffer,
  filename: string,
  mimetype: string,
): Promise<string> => {

  // convert the Node.js Buffer into an OpenAI-compatible upload

  const audioFile = await toFile(
    audioBuffer, 
    filename, 
    {
        type: mimetype 
    }
  )

  // Send the audio to OpenAI for speech-to-text transcription 

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "gpt-4o-mini-transcribe",
  });

  return transcription.text.trim(); // return only the transcript text to the service layer 
};
