
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Language, PracticeSheet, CodeExecutionResult, ChatMessage } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Using mock data. Please set process.env.API_KEY.");
}

// Conditionally initialize `ai` only if API_KEY is present
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Safely parses a JSON string, stripping markdown fences if present.
 * @param jsonString The raw string from the AI response.
 * @returns The parsed JSON object.
 */
function safeParseJson<T>(jsonString: string): T {
    let text = jsonString.trim();
    if (text.startsWith('```json')) {
        text = text.substring(7, text.length - 3).trim();
    } else if (text.startsWith('```')) {
        text = text.substring(3, text.length - 3).trim();
    }
    return JSON.parse(text) as T;
}


export const generateQuizQuestions = async (topic: string, language: Language): Promise<QuizQuestion[]> => {
  if (!ai || !API_KEY) { // Check if ai is initialized
    // Return mock data if API key is not available
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          {
            question: `MOCK: What is the main purpose of a 'for' loop in ${language}?`,
            options: ["To declare variables", "To execute a block of code repeatedly", "To handle exceptions", "To define a function"],
            correctAnswer: "To execute a block of code repeatedly",
          },
          {
            question: "MOCK: Which keyword is used to define a function in Python?",
            options: ["func", "def", "function", "define"],
            correctAnswer: "def",
          },
          {
            question: `MOCK: What does 'System.out.println()' do in ${language}?`,
            options: ["Reads input from the console", "Prints output to the console with a new line", "Creates a new file", "Calculates a mathematical expression"],
            correctAnswer: "Prints output to the console with a new line",
          },
        ]);
      }, 1000)
    );
  }

  const prompt = `Generate 3-5 short, multiple-choice quiz questions for a beginner learning about "${topic}" in ${language}.
  Ensure the questions are clear and concise.
  Return ONLY a valid JSON object with a single key "questions", which is an array of question objects.
  Each question object must have "question" (string), "options" (array of strings), and "correctAnswer" (string) keys.
  Do not include any markdown formatting or other text outside the JSON object.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = safeParseJson<{ questions: QuizQuestion[] }>(response.text);
    return parsed.questions;

  } catch (error) {
    console.error("Error generating quiz questions with Gemini:", error);
    // Fallback to mock data on API error
    return [
        {
          question: "API Error (Mock): What is a variable?",
          options: ["A", "B", "C", "D"],
          correctAnswer: "A",
        },
      ];
  }
};

export const generatePracticeSheet = async (topic: string, language: Language, numQuestions: number): Promise<PracticeSheet | null> => {
  if (!ai || !API_KEY) { // Check if ai is initialized
    console.warn("Gemini API key not found, returning mock practice sheet.");
    return new Promise(resolve => setTimeout(() => resolve({
        easy: { questions: ["MOCK Easy Q1?", "MOCK Easy Q2?"], motivation: "Easy motivation!" },
        medium: { questions: ["MOCK Medium Q1?", "MOCK Medium Q2?"], motivation: "Medium motivation!" },
        hard: { questions: ["MOCK Hard Q1?", "MOCK Hard Q2?"], motivation: "Hard motivation!" },
    }), 1500));
  }

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

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
        },
    });

    const parsed = safeParseJson<PracticeSheet>(response.text);
    return parsed;
  } catch (error) {
    console.error("Error generating practice sheet with Gemini:", error);
    return null;
  }
};

export const executeJavaCode = async (code: string): Promise<CodeExecutionResult> => {
    if (!ai || !API_KEY) { // Check if ai is initialized
        console.warn("Gemini API key not found, returning mock code execution result.");
        if (code.includes("error")) {
             return new Promise(resolve => setTimeout(() => resolve({
                error: "Mock Error: Main method not found in class HelloWorld, please define the main method as:\n   public static void main(String[] args)\nor a JavaFX application class must extend javafx.application.Application"
             }), 1000));
        }
        return new Promise(resolve => setTimeout(() => resolve({
            output: "MOCK: Hello, Commitly User!"
        }), 1000));
    }
    
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

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return safeParseJson<CodeExecutionResult>(response.text);
    } catch (error) {
        console.error("Error executing Java code with Gemini:", error);
        return { error: "Failed to connect to the code execution service. Please try again." };
    }
};

export const chatWithCommi = async (code: string, userMessage: string, chatHistory: ChatMessage[], language: Language): Promise<string> => {
  if (!ai || !API_KEY) { // Check if ai is initialized
    console.warn("Gemini API key not found, Pixi will not respond.");
    return "Hi there! My API key isn't set up, so I can't chat right now. Please tell your developer to set `process.env.API_KEY`.";
  }

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
  if (!ai || !API_KEY) { // Check if ai is initialized
    console.warn("Gemini API key not found, Pixi will not respond with error explanation.");
    return "Hi there! My API key isn't set up, so I can't explain errors right now. Please tell your developer to set `process.env.API_KEY`.";
  }

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
