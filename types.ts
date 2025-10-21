export interface TranscriptEntry {
  id: number;
  timestamp: string;
  speaker: string;
  text: string;
}

// Fix: Add GeminiAnalysisResult type, which was missing.
export interface GeminiAnalysisResult {
  id: number;
  isQuestion: boolean;
  isActionItem: boolean;
}

export type AnalyzedTranscriptEntry = TranscriptEntry &
  Partial<Omit<GeminiAnalysisResult, 'id'>>;
