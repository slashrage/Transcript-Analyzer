import { GoogleGenAI, Type } from "@google/genai";
import type { TranscriptEntry, GeminiAnalysisResult } from '../types';

export async function analyzeTranscript(
  transcriptEntries: TranscriptEntry[]
): Promise<GeminiAnalysisResult[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  
  const entriesForPrompt = transcriptEntries.map(({ id, text }) => ({ id, text }));

  const prompt = `
    Analyze the following meeting transcript entries. For each entry, determine if it is a question AND if it is an action item or task.
    An action item is a task assigned to someone or a commitment to do something.
    The transcript is provided as an array of objects, each with an 'id' and 'text'.
    Respond with a JSON array where each object corresponds to a transcript entry.
    Each object in your response MUST contain the original 'id', a boolean 'isQuestion', and a boolean 'isActionItem'.
    Only respond with the JSON array. Do not add any extra text, explanations, or markdown formatting.

    Transcript:
    ${JSON.stringify(entriesForPrompt, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER },
                isQuestion: { 
                    type: Type.BOOLEAN, 
                    description: 'True if the text is a question, false otherwise.' 
                },
                isActionItem: {
                    type: Type.BOOLEAN,
                    description: 'True if the text contains an action item or task to be completed.'
                }
              },
              required: ['id', 'isQuestion', 'isActionItem']
            },
          },
        },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (!Array.isArray(result)) {
        throw new Error("Gemini API did not return a valid JSON array.");
    }

    return result as GeminiAnalysisResult[];

  } catch (error) {
    console.error("Error analyzing transcript with Gemini:", error);
    throw new Error("Failed to get analysis from Gemini API. The response may be invalid or the service is unavailable.");
  }
}