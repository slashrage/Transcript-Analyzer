import type { TranscriptEntry, GeminiAnalysisResult } from '../types';

export async function analyzeTranscript(
  transcriptEntries: TranscriptEntry[]
): Promise<GeminiAnalysisResult[]> {
  const apiKey = process.env.API_KEY as string;
  
  if (!apiKey) {
    throw new Error("Claude API key is not configured");
  }

  const entriesForPrompt = transcriptEntries.map(({ id, text }) => ({ id, text }));

  const prompt = `Analyze the following meeting transcript entries. For each entry, determine if it is a question AND if it is an action item or task.
An action item is a task assigned to someone or a commitment to do something.

The transcript is provided as an array of objects, each with an 'id' and 'text'.

Respond with a JSON array where each object corresponds to a transcript entry.
Each object in your response MUST contain the original 'id', a boolean 'isQuestion', and a boolean 'isActionItem'.

Only respond with the JSON array. Do not add any extra text, explanations, or markdown formatting.

Transcript:
${JSON.stringify(entriesForPrompt, null, 2)}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error("Claude API returned an unexpected response format");
    }

    const jsonString = data.content[0].text.trim();
    
    // Remove markdown code blocks if present
    const cleanedJson = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const result = JSON.parse(cleanedJson);

    if (!Array.isArray(result)) {
      throw new Error("Claude API did not return a valid JSON array.");
    }

    return result as GeminiAnalysisResult[];

  } catch (error) {
    console.error("Error analyzing transcript with Claude:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to get analysis from Claude API: ${error.message}`);
    }
    throw new Error("Failed to get analysis from Claude API. The response may be invalid or the service is unavailable.");
  }
}
