
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion, Language } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Using mock data. Please set process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateQuizQuestions = async (topic: string, language: Language): Promise<QuizQuestion[]> => {
  if (!API_KEY) {
    // Return mock data if API key is not available
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve([
          {
            question: `What is the main purpose of a 'for' loop in ${language}?`,
            options: ["To declare variables", "To execute a block of code repeatedly", "To handle exceptions", "To define a function"],
            correctAnswer: "To execute a block of code repeatedly",
          },
          {
            question: "Which keyword is used to define a function in Python?",
            options: ["func", "def", "function", "define"],
            correctAnswer: "def",
          },
          {
            question: `What does 'System.out.println()' do in ${language}?`,
            options: ["Reads input from the console", "Prints output to the console with a new line", "Creates a new file", "Calculates a mathematical expression"],
            correctAnswer: "Prints output to the console with a new line",
          },
        ]);
      }, 1000)
    );
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 3-5 short, multiple-choice quiz questions for a beginner learning about "${topic}" in ${language}. Ensure the questions are clear and concise.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              description: "An array of quiz questions.",
              items: {
                type: Type.OBJECT,
                properties: {
                  question: {
                    type: Type.STRING,
                    description: "The quiz question text.",
                  },
                  options: {
                    type: Type.ARRAY,
                    description: "An array of possible answers (strings).",
                    items: {
                      type: Type.STRING,
                    },
                  },
                  correctAnswer: {
                    type: Type.STRING,
                    description: "The correct answer from the options.",
                  },
                },
                required: ["question", "options", "correctAnswer"],
              },
            },
          },
          required: ["questions"],
        },
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    return parsed.questions as QuizQuestion[];

  } catch (error) {
    console.error("Error generating quiz questions with Gemini:", error);
    // Fallback to mock data on API error
    return [
        {
          question: "API Error: What is a variable?",
          options: ["A", "B", "C", "D"],
          correctAnswer: "A",
        },
      ];
  }
};
