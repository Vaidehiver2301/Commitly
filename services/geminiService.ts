

import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Language, PracticeSheet, CodeExecutionResult, ChatMessage } from "../types";

const API_KEY = process.env.API_KEY;

// Conditionally initialize `ai` to prevent crashes if API_KEY is undefined in browser.
// This allows the app to run with mock data if the key isn't configured,
// but the guideline is to use `process.env.API_KEY` exclusively.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

if (!API_KEY) {
  console.warn("Gemini API key not found. Using mock data. Please set process.env.API_KEY.");
}

/**
 * Parses a JSON string, stripping markdown fences if present.
 * This is a basic implementation to handle common AI response formats.
 * @param jsonString The raw string from the AI response.
 * @returns The parsed JSON object.
 */
function parseJsonWithMarkdownProtection<T>(jsonString: string): T {
    let cleanedString = jsonString.trim();
    // Remove markdown code block fences if present
    if (cleanedString.startsWith('```json')) {
        cleanedString = cleanedString.substring(7, cleanedString.lastIndexOf('```')).trim();
    } else if (cleanedString.startsWith('```')) {
        cleanedString = cleanedString.substring(3, cleanedString.lastIndexOf('```')).trim();
    }
    return JSON.parse(cleanedString);
}


export const generateQuizQuestions = async (topic: string, language: Language): Promise<QuizQuestion[]> => {
  const prompt = `Generate 3-5 short, multiple-choice quiz questions for a beginner learning about "${topic}" in ${language}.
  Ensure the questions are clear and concise.
  Return ONLY a valid JSON object with a single key "questions", which is an array of question objects.
  Each question object must have "question" (string), "options" (array of strings), and "correctAnswer" (string) keys.
  Do not include any markdown formatting or other text outside the JSON object.`;

  if (!ai || !API_KEY) {
    return Promise.resolve([
      {
        question: `MOCK: What is the capital of ${topic}?`,
        options: ["Paris", "London", "Berlin", "Madrid"],
        correctAnswer: "Paris",
      },
      {
        question: `MOCK: Which planet is known as the Red Planet?`,
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        correctAnswer: "Mars",
      },
    ]);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // Assume response.text() directly returns the JSON string if responseMimeType is application/json
    // Or parse if it's potentially wrapped in markdown
    const parsed = parseJsonWithMarkdownProtection<{ questions: QuizQuestion[] }>(response.text);
    return parsed.questions;

  } catch (error) {
    console.error("Error generating quiz questions with Gemini:", error);
    // Fallback to a user-friendly error message on API error
    return [{
        question: "Failed to generate quiz questions. Please try again later.",
        options: ["A", "B", "C"],
        correctAnswer: "A"
    }];
  }
};

export const generatePracticeSheet = async (topic: string, language: Language, numQuestions: number): Promise<PracticeSheet | null> => {
  const prompt = `Generate practice coding questions about '${topic}' in ${language}.
Create exactly ${numQuestions} coding problems for each of the three distinct difficulty levels: Easy, Medium, and Hard.
All questions must be coding exercises or problems to solve, not conceptual or debugging questions.
For each level, also provide a short, unique motivational message at the end.
Return ONLY a valid JSON object with the structure:
{
  "easy": { "questions": ["...", "..."], "motivation": "..." },
  "medium": { "questions": ["...", "..."], "motivation": "..." },
  "hard": { "questions": ["...", "..."], "motivation": "..." }
}
Do not include any other text or markdown formatting. The entire response must be a single valid JSON object.`;

  if (!ai || !API_KEY) {
    const mockSheet: PracticeSheet = {
      easy: {
        questions: Array(numQuestions).fill(`MOCK: Easy ${language} question about ${topic}.`),
        motivation: "MOCK: Keep up the great work on easy problems!",
      },
      medium: {
        questions: Array(numQuestions).fill(`MOCK: Medium ${language} question about ${topic}.`),
        motivation: "MOCK: You're tackling the challenge, keep pushing!",
      },
      hard: {
        questions: Array(numQuestions).fill(`MOCK: Hard ${language} question about ${topic}.`),
        motivation: "MOCK: Mastering the tough stuff, amazing effort!",
      },
    };
    return Promise.resolve(mockSheet);
  }

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        },
    });

    const parsed = parseJsonWithMarkdownProtection<PracticeSheet>(response.text);
    return parsed;
  } catch (error) {
    console.error("Error generating practice sheet with Gemini:", error);
    return null;
  }
};

export const executeJavaCode = async (code: string): Promise<CodeExecutionResult> => {
    const prompt = `You are a Java code interpreter. Execute the following Java code.
- The code must be a complete, runnable Java program with a \`main\` method.
- If the code compiles and runs successfully, return the standard output.
- If there is a compilation error or a runtime error, return the detailed error message.

Return ONLY a single valid JSON object with either an "output" key (for success) or an "error" key (for failure).
Example success: { "output": "Hello World" }
Example error: { "error": "Main method not found..." }
Do not include any other commentary or markdown formatting.

Code:
\`\`\`java
${code}
\`\`\``;

    if (!ai || !API_KEY) {
        if (code.includes("System.out.println")) {
            return Promise.resolve({ output: "MOCK: Hello from the Java sandbox!" });
        } else {
            return Promise.resolve({ error: "MOCK: Compile error: Cannot find symbol 'println'" });
        }
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return parseJsonWithMarkdownProtection<CodeExecutionResult>(response.text);
    } catch (error) {
        console.error("Error executing Java code with Gemini:", error);
        return { error: "Failed to connect to the code execution service. Please try again." };
    }
};

export const chatWithCommi = async (code: string, userMessage: string, chatHistory: ChatMessage[], language: Language): Promise<string> => {
  const historyContent = chatHistory.map(msg => ({
    text: `${msg.sender === 'user' ? 'User' : 'Pixi'}: ${msg.message}`
  }));

  const systemInstruction = `You are Pixi, a friendly, encouraging, and helpful AI coding assistant for Commitly. Your goal is to guide users through their ${language} coding problems and error messages without giving direct answers.
  Tiny helper. Big progress.
  
  When explaining errors:
  - Be clear and concise.
  - Explain what the error means in simple terms.
  - Suggest steps the user can take to debug or fix the issue.
  - Do NOT provide the exact corrected code.

  When assessing code or providing guidance:
  - Offer constructive feedback or hints.
  - Encourage best practices.
  - Break down complex problems into smaller parts.
  - Do NOT write full solutions for the user.

  Maintain a positive and supportive tone at all times.`;

  const contents = [
    { text: `Current ${language} Code:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`\n` },
    ...historyContent,
    { text: `User: ${userMessage}` },
    { text: "Pixi:" }
  ];

  if (!ai || !API_KEY) {
    return Promise.resolve("MOCK: Hello! This is a mock response from Pixi. I'm here to help, but currently using sample data.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error chatting with Pixi:", error);
    return "Oops! I encountered an error trying to process your request. Please try again or rephrase your question.";
  }
};

export const getPixiErrorExplanation = async (code: string, rawErrorMessage: string, language: Language): Promise<string> => {
  const systemInstruction = `You are Pixi, a friendly, encouraging, and helpful AI coding assistant for Commitly. Your goal is to guide users through their ${language} coding problems and error messages without giving direct answers.
  Tiny helper. Big progress.
  
  When explaining errors:
  - Be clear and concise.
  - Explain what the error means in simple terms.
  - Suggest steps the user can take to debug or fix the issue.
  - Do NOT provide the exact corrected code.
  - Keep the response encouraging and supportive.

  Current ${language} Code:\n\`\`\`${language.toLowerCase()}\n${code}\n\`\`\`\n
  The user just received this error message: "${rawErrorMessage}"`;

  const contents = [
    { text: "Pixi: Explain this error in a helpful, guiding way." }
  ];

  if (!ai || !API_KEY) {
    return Promise.resolve(`MOCK: It looks like you've encountered an error! This is a mock explanation from Pixi. In a real scenario, I'd help you understand "${rawErrorMessage}" and give you hints to fix it, like checking your syntax or variable names.`);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating Pixi error explanation:", error);
    return "Oops! I encountered an error trying to analyze your code's error. Please try again or rephrase your question manually.";
  }
};