import OpenAI from "openai";
import { toFile } from "openai/uploads.js";

// OpenAI client used specifically for speech-to-text

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
})

// Converts the uploaded audio buffer into an OpenAI-compatible file and sends it to the transcription model 

export const transcribeCandidateAudio = async (
    audioBuffer: Buffer,
    filename: string , 
    mimetype: string 
): Promise<string> => {

    // convert the Node.js buffer into an OpenAI file object 

    const audioFile = await toFile(
        audioBuffer, 
        filename, 
        {
            type: mimetype
        }
    ) ; 

    // send the candidate's recordingn to OpenAI speech-to-text 

    const transcription = await client.audio.transcriptions.create({
        file: audioFile, 
        model: "gpt-4o-mini-transcribe"
    }) ; 

    return transcription.text.trim() ; // return only the cleaned transcript 

}