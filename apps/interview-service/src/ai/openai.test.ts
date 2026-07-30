import { generateQuestion } from "./openai.service.js";

const main = async () => {
    const question = await generateQuestion(
        "Generate one React Interview question."
    )

    console.log("AI Question: ", question)
}

main() ; 

/*
Verifies that the OpenAI API is correctly configured and accessible. 

This standalone test allows us to validate AI Integration without involving interview services or API endpoints. 

This file is for development/testing only and will be removed once OpenAI integration is fully verified. 
*/