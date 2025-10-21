import React, { useState } from 'react';
import type { ProfanityReport } from '../types';
import WarningIcon from './icons/WarningIcon';

interface ProfanityTrackerProps {
  report: ProfanityReport;
}

const ProfanityTracker: React.FC<ProfanityTrackerProps> = ({ report }) => {
  const [isExpanded, setIsExpanded] = useState(true);

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
            <ul className="text-gray-400 space-y-1 text-sm">
              {Object.entries(report.byWord)
                // Fix: Replaced destructuring with indexed access to prevent a TypeScript type inference error on the sort parameters.
                .sort((a, b) => b[1] - a[1])
                .map(([word, count]) => (
                  <li key={word} className="flex justify-between items-center">
                    <span className="font-mono bg-gray-900/50 px-1.5 py-0.5 rounded text-red-400 border border-red-800/50">{word}</span>
                    <span>{count} times</span>
                  </li>
              ))}
            </ul>
          </div>
          <div className="pt-4 border-t border-gray-700">
            <h4 className="font-semibold text-gray-300 mb-2">By Speaker:</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              {Object.entries(report.bySpeaker).map(([speaker, words]) => (
                <li key={speaker}>
                  <strong className="text-teal-300">{speaker}:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    {Object.entries(words).map(([word, count]) => (
                      <li key={word}><span className="font-mono text-red-400">{word}</span> ({count})</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfanityTracker;
