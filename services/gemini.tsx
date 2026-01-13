
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message } from "../types";
import { SYSTEM_INSTRUCTION, APP_CONFIG } from "../constants";

export async function* sendMessageStreaming(message: string, history: Message[]) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Format history for the Gemini API
  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const result = await ai.models.generateContentStream({
      model: APP_CONFIG.MODEL_NAME,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      yield c.text || "";
    }
  } catch (error) {
    console.error("Critical API Error:", error);
    throw error;
  }
}

