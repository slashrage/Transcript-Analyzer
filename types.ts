export interface TranscriptEntry {
  id: number;
  timestamp: string;
  speaker: string;
  text: string;
}

export interface GeminiAnalysisResult {
  id: number;
  isQuestion: boolean;
  isActionItem: boolean;
}

export type AnalyzedTranscriptEntry = TranscriptEntry &
  Partial<Omit<GeminiAnalysisResult, 'id'>>;

export interface ProfanityReport {
  totalCount: number;
  byWord: Record<string, number>;
  bySpeaker: Record<string, Record<string, number>>;
}
