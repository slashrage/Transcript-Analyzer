import React from 'react';
import type { AnalyzedTranscriptEntry } from '../types';
import ActionItemIcon from './icons/ActionItemIcon';
import QuestionIcon from './icons/QuestionIcon';

interface TranscriptViewProps {
  transcript: AnalyzedTranscriptEntry[];
  fileName: string;
  totalEntries: number;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({ transcript, fileName, totalEntries }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6">
      <div className="mb-6 pb-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white truncate" title={fileName}>{fileName}</h2>
        <p className="text-gray-400 mt-1">Showing {transcript.length} of {totalEntries} entries</p>
      </div>

      {transcript.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-gray-400">No entries match the current filters.</p>
        </div>
      ) : (
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-4">
          {transcript.map(entry => (
            <div 
              key={entry.id} 
              className="p-4 rounded-lg bg-gray-700/50 shadow-md flex items-start gap-4 transition-all hover:bg-gray-700"
            >
                <div className="flex-shrink-0 w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center font-bold text-teal-400 text-lg">
                    {entry.speaker.split(' ').map(n => n[0]).slice(0,2).join('')}
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-center mb-1">
                        <p className="font-bold text-teal-300">{entry.speaker}</p>
                        {entry.timestamp && <p className="text-xs text-gray-500">{entry.timestamp.split(' --> ')[0]}</p>}
                    </div>
                    <p className="text-gray-200">{entry.text}</p>
                    {(entry.isQuestion || entry.isActionItem) && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-600/50">
                        {entry.isQuestion && (
                          <span className="flex items-center text-sm text-sky-400 font-medium">
                            <QuestionIcon className="w-5 h-5 mr-2" />
                            Question
                          </span>
                        )}
                        {entry.isActionItem && (
                          <span className="flex items-center text-sm text-amber-400 font-medium">
                            <ActionItemIcon className="w-5 h-5 mr-2" />
                            Action Item
                          </span>
                        )}
                      </div>
                    )}
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TranscriptView;
