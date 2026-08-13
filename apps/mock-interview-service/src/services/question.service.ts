import axios from "axios";
import openai from "../providers/openai.provider.js";

// Fixed interview structure.
// Each question tests a different area.
const QUESTION_FOCUS = [
  "Professional work experience, responsibilities, problem solving and engineering decisions",

  "Frontend development: React.js, Next.js, state management, performance and UI development",

  "Backend development: Node.js, Express.js, REST APIs, WebSockets and microservices",

  "Databases and caching: MongoDB, MySQL, PostgreSQL, Redis and data handling",

  "Cloud and DevOps: AWS, Docker, CI/CD, deployment and production systems",
];


// Generates one interview question for the given question number.
export const generateNextQuestion = async (
  documentId: string,
  questionNumber: number,
) => {
  if (
    questionNumber < 1 ||
    questionNumber > QUESTION_FOCUS.length
  ) {
    throw new Error("Invalid question number");
  }

  const focus = QUESTION_FOCUS[questionNumber - 1];

  // Get resume information relevant to the current interview area.
  const ragResponse = await axios.post(
    `${process.env.RAG_SERVICE_URL}/api/v1/rag/search`,
    {
      question: `
Find information from this candidate's resume that helps determine
their experience and skill level for the following interview area:

${focus}
      `,
      documentId,
    },
  );

  const chunks = ragResponse.data.data.chunks;

  const context = chunks
    .map((chunk: any) => chunk.text)
    .join("\n\n");


  // Generate exactly one question.
  const completion =
    await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL!,

      messages: [
        {
          role: "system",

          content: `
You are a professional human interviewer conducting
a technical mock interview.

This is question ${questionNumber} of 5.

INTERVIEW FOCUS:
${focus}

IMPORTANT RULES:

1. Ask exactly ONE interview question.

2. Question 1 must focus on the candidate's professional
   experience, responsibilities, problem solving and
   engineering decisions.

3. Question 1 should NOT automatically be about a project.

4. Questions 2-5 must strictly focus on their assigned
   technical area.

5. Do NOT repeatedly focus on Redis, caching, or InkFlow.

6. Questions 2-5 must NOT mention any specific project,
   company or product from the resume unless absolutely
   necessary for the question.

7. Use the resume only to understand what technologies
   and experience level the candidate has.

8. Do not keep selecting the most frequently mentioned
   technology from the resume.

9. Avoid asking about the same technology more than once.

10. Each question should test a different concept.

11. Ask a realistic interview question that a human
    interviewer would ask a developer with 2+ years
    of experience.

12. Do not make the question unnecessarily advanced.

13. Do not combine multiple unrelated questions.

14. Do not provide the answer.

15. Return ONLY the question.

Candidate resume information:

${context}
          `,
        },

        {
          role: "user",

          content: `
Generate interview question ${questionNumber}
according to the assigned focus.
          `,
        },
      ],
    });

  const question =
    completion.choices[0]?.message?.content?.trim();

  if (!question) {
    throw new Error(
      "Failed to generate interview question",
    );
  }

  return question;
};