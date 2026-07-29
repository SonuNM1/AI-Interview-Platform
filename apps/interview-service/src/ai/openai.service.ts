/*Communicates with the OpenAI API. This service will generate interview questions, evaluate answers, and produce interview reports.
*/

export const generateQuestion = async (
  prompt: string
): Promise<string> => {

  // TODO:
  // Replace this with OpenAI API integration.

  console.log(prompt);

  return "What challenges have you faced while building scalable React applications?";

};