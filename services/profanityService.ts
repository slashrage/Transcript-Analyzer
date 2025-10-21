import { profanitySet } from './profanityList';
import type { TranscriptEntry, ProfanityReport } from '../types';

export function analyzeProfanity(entries: TranscriptEntry[]): ProfanityReport {
  const report: ProfanityReport = {
    totalCount: 0,
    byWord: {},
    bySpeaker: {},
  };

  for (const entry of entries) {
    // Simple word tokenization: lowercase, remove common punctuation, split by space
    const words = entry.text
      .toLowerCase()
      .replace(/[.,!?"]/g, '')
      .split(/\s+/);

    for (const word of words) {
      if (profanitySet.has(word)) {
        report.totalCount++;
        
        // Increment count by word
        report.byWord[word] = (report.byWord[word] || 0) + 1;

        // Increment count by speaker
        if (!report.bySpeaker[entry.speaker]) {
          report.bySpeaker[entry.speaker] = {};
        }
        report.bySpeaker[entry.speaker][word] = (report.bySpeaker[entry.speaker][word] || 0) + 1;
      }
    }
  }

  return report;
}
