
import type { TranscriptEntry } from '../types';

export function parseTranscript(fileContent: string): { entries: TranscriptEntry[], speakers: string[] } {
  const entries: TranscriptEntry[] = [];
  const speakers = new Set<string>();
  let idCounter = 0;

  const content = fileContent.replace(/\r\n/g, '\n'); // Normalize line endings

  if (content.trim().startsWith('WEBVTT')) {
    const blocks = content.split('\n\n').slice(1);
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 2) continue;

      const timestampLineIndex = lines.findIndex(line => line.includes('-->'));
      if (timestampLineIndex === -1 || timestampLineIndex + 1 >= lines.length) continue;

      const timestamp = lines[timestampLineIndex].trim();
      const contentLine = lines.slice(timestampLineIndex + 1).join(' ').trim();
      
      const parts = contentLine.split(':');
      if (parts.length > 1) {
        let speaker = parts[0].trim();
        // Handle speaker names with titles like "Name | Role"
        if (speaker.includes('|')) {
            speaker = speaker.split('|')[0].trim();
        }
        const text = parts.slice(1).join(':').trim();
        
        if (speaker && text) {
          entries.push({ id: idCounter++, timestamp, speaker, text });
          speakers.add(speaker);
        }
      }
    }
  } else {
    // Basic plain text parsing
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const parts = trimmedLine.split(':');
      if (parts.length > 1) {
        let speaker = parts[0].trim();
        if (speaker.includes('|')) {
            speaker = speaker.split('|')[0].trim();
        }
        const text = parts.slice(1).join(':').trim();
        
        if (speaker && text) {
          entries.push({ id: idCounter++, timestamp: '', speaker, text });
          speakers.add(speaker);
        }
      } else {
        entries.push({ id: idCounter++, timestamp: '', speaker: 'Unknown', text: trimmedLine });
        speakers.add('Unknown');
      }
    }
  }
  return { entries, speakers: Array.from(speakers).sort() };
}
