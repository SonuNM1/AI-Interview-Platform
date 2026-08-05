import axios from "axios";

// Streams AI response from AI Service

export const streamAIResponse = async (
  conversationId: string,
  message: string,
  onStart: () => void,
  onToken: (token: string) => void,
  onEnd: () => void,
) => {

  console.log("➡️ Calling AI Service...");

  console.log(process.env.AI_SERVICE_URL);

  const response = await axios({
    method: "POST", 
    url: `${process.env.AI_SERVICE_URL}/api/v1/mentor/chat/stream`, 
    responseType: "stream", 
    data: {
      conversationId, 
      message 
    }
  }) ; 

  console.log("✅ Connected to AI stream");

  onStart() ; 

  response.data.on("data", (chunk: Buffer) => {
    onToken(chunk.toString()) 
  }) ; 

  response.data.on("end", ()=> {
    onEnd() ; 
  })
};
