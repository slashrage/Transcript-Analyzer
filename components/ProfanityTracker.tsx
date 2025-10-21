import React, { useState, useMemo } from 'react';
import type { ProfanityReport } from '../types';
import WarningIcon from './icons/WarningIcon';

interface ProfanityTrackerProps {
  report: ProfanityReport;
}

const ProfanityBar: React.FC<{ value: number; maxValue: number }> = ({ value, maxValue }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5 my-1">
      <div 
        className="bg-red-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
        style={{ width: `${percentage}%` }}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={maxValue}
        role="progressbar"
      ></div>
    </div>
  );
};


const ProfanityTracker: React.FC<ProfanityTrackerProps> = ({ report }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const sortedByWord = useMemo(() => {
    return Object.entries(report.byWord).sort((a, b) => b[1] - a[1]);
  }, [report.byWord]);

  const maxWordCount = useMemo(() => {
    return sortedByWord.length > 0 ? sortedByWord[0][1] : 1;
  }, [sortedByWord]);
  
  const sortedBySpeaker = useMemo(() => {
      return Object.entries(report.bySpeaker).sort((a, b) => {
          // FIX: Removed explicit types from reduce callback to allow for correct type inference.
          const totalA = Object.values(a[1]).reduce((sum, count) => sum + count, 0);
          const totalB = Object.values(b[1]).reduce((sum, count) => sum + count, 0);
          return totalB - totalA;
      });
  }, [report.bySpeaker]);


  if (report.totalCount === 0) {
    return null; // Don't render if no profanities found
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg mt-8">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full font-semibold text-left text-gray-200 mb-4"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center">
          <WarningIcon className="w-5 h-5 mr-3 text-amber-400" />
          <span>Profanity Report ({report.totalCount})</span>
        </div>
        <svg
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isExpanded && (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          <div>
            <h4 className="font-semibold text-gray-300 mb-2">By Word:</h4>
            <ul className="text-gray-400 space-y-3 text-sm">
              {sortedByWord.map(([word, count]) => (
                  <li key={word}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono bg-gray-900/50 px-1.5 py-0.5 rounded text-red-400 border border-red-800/50">{word}</span>
                      <span>{count} {count > 1 ? 'times' : 'time'}</span>
                    </div>
                    <ProfanityBar value={count} maxValue={maxWordCount} />
                  </li>
              ))}
            </ul>
          </div>
          <div className="pt-4 border-t border-gray-700">
            <h4 className="font-semibold text-gray-300 mb-2">By Speaker:</h4>
            <ul className="space-y-4 text-gray-400 text-sm">
              {sortedBySpeaker.map(([speaker, words]) => {
                // FIX: Removed explicit types from reduce callback to allow for correct type inference.
                const speakerTotal = Object.values(words).reduce((sum, count) => sum + count, 0);
                const sortedWordsForSpeaker = Object.entries(words).sort((a,b) => b[1] - a[1]);
                const maxWordCountForSpeaker = sortedWordsForSpeaker.length > 0 ? sortedWordsForSpeaker[0][1] : 1;

                return (
                  <li key={speaker}>
                    <div className="flex justify-between items-baseline">
                        <strong className="text-teal-300">{speaker}</strong>
                        <span className="text-xs text-gray-500">Total: {speakerTotal}</span>
                    </div>
                    <ul className="mt-2 space-y-3 pl-2 border-l border-gray-700">
                      {sortedWordsForSpeaker.map(([word, count]) => (
                        <li key={word}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-mono text-red-400">{word}</span>
                             <span>{count}</span>
                          </div>
                          <ProfanityBar value={count} maxValue={maxWordCountForSpeaker} />
                        </li>
                      ))}
                    </ul>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfanityTracker;