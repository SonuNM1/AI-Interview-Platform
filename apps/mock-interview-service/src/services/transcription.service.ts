import { transcribeAudio } from "../providers/transcription.provider.js";

// handles the transcription business logic between the controller and provider

export const transcribeCandidateAudio = async (
  audioBuffer: Buffer,
  filename: string,
  mimetype: string,
) => {
  // preventing sending an empty audio file to the transcription provider

  if (!audioBuffer || audioBuffer.length === 0) {
    throw new Error("Audio file is empty");
  }

  // delegates speech-to-text processing to the transcription provider

  const transcript = await transcribeAudio(audioBuffer, filename, mimetype);

  console.log("🎤 Transcription:", transcript); // verify that the audio was transcribed properly 

  // making sure the provider actually returned usable text

  if (!transcript) {
    throw new Error("Could not generate transcript");
  }

  return transcript;
};
