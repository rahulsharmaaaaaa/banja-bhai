import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);
// Using gemini-2.5-flash as specified by the user.
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function checkQuestionWithGemini(question) {
  const { question_statement, options, question_type } = question;
  let prompt = "";
  let aiResponse = "";

  // Ensure options is an array for MCQ/MSQ, parsing if it's a JSON string
  const optionsArray = Array.isArray(options)
    ? options
    : (typeof options === 'string' ? JSON.parse(options) : []);

  try {
    switch (question_type) {
      case "MCQ":
      case "MSQ":
        prompt = `Solve the following multiple-choice question and provide only the final answer. If the answer is one of the options, state the option exactly as it appears. If it's a numerical answer, state the number.
        Question: ${question_statement}
        Options: ${optionsArray.join(', ')}
        
        Your Answer:`;
        const mcqResult = await model.generateContent(prompt);
        aiResponse = mcqResult.response.text().trim();
        // Check if the AI's answer is present in the options (case-insensitive)
        const isMcqWrong = !optionsArray.some(option => aiResponse.toLowerCase().includes(option.toLowerCase()));
        return isMcqWrong;

      case "NAT": // Numerical Answer Type
        prompt = `Solve the following question and provide only the final numerical answer. If the question is not numerical or cannot be solved numerically, state 'NON_NUMERICAL'.
        Question: ${question_statement}
        
        Your Answer:`;
        const natResult = await model.generateContent(prompt);
        aiResponse = natResult.response.text().trim();
        // Check if the AI's response is a valid number
        const isNatWrong = isNaN(parseFloat(aiResponse));
        return isNatWrong;

      case "SUB": // Subjective
        prompt = `Evaluate the following subjective question. Is it possible to provide a coherent proof or answer for this question? Respond with 'POSSIBLE' if a reasonable answer or proof can be constructed, and 'IMPOSSIBLE' if the question is ill-posed, ambiguous, or cannot be answered.
        Question: ${question_statement}
        
        Your Evaluation:`;
        const subResult = await model.generateContent(prompt);
        aiResponse = subResult.response.text().trim().toUpperCase();
        // Check if the AI determined it's impossible
        const isSubWrong = (aiResponse === 'IMPOSSIBLE');
        return isSubWrong;

      default:
        console.warn(`Unknown question type: ${question_type}. Marking as wrong by default.`);
        return true; // If type is unknown, consider it wrong
    }
  } catch (error) {
    console.error("Error checking question with Gemini:", error);
    // In case of API error, it's safer to mark as wrong or handle specifically
    return true; // Mark as wrong on API error
  }
}

export { checkQuestionWithGemini };
