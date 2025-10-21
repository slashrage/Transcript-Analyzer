import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import SpeakerIcon from './icons/SpeakerIcon';
import QuestionIcon from './icons/QuestionIcon';
import ActionItemIcon from './icons/ActionItemIcon';

interface FilterControlsProps {
  speakers: string[];
  selectedSpeakers: string[];
  onSpeakerChange: (speakers: string[]) => void;
  analysisFilter: { isQuestion: boolean; isActionItem: boolean };
  onAnalysisFilterChange: (filter: {
    isQuestion: boolean;
    isActionItem: boolean;
  }) => void;
  hasAnalysisResults: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  speakers,
  selectedSpeakers,
  onSpeakerChange,
  analysisFilter,
  onAnalysisFilterChange,
  hasAnalysisResults,
}) => {
  const [isSpeakersExpanded, setIsSpeakersExpanded] = useState(true);

  const handleSpeakerSelection = (e: ChangeEvent<HTMLInputElement>) => {
    const speaker = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      onSpeakerChange([...selectedSpeakers, speaker]);
    } else {
      onSpeakerChange(selectedSpeakers.filter(s => s !== speaker));
    }
  };
  
  const toggleAllSpeakers = () => {
    if (selectedSpeakers.length === speakers.length) {
      onSpeakerChange([]);
    } else {
      onSpeakerChange(speakers);
    }
  };

  const handleAnalysisFilterChange = (
    filterName: 'isQuestion' | 'isActionItem'
  ) => {
    onAnalysisFilterChange({
      ...analysisFilter,
      [filterName]: !analysisFilter[filterName],
    });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg sticky top-24">
      <h3 className="text-xl font-bold mb-4 text-white border-b border-gray-700 pb-3">Filters</h3>
      
      <div>
        <button
            onClick={() => setIsSpeakersExpanded(!isSpeakersExpanded)}
            className="flex items-center justify-between w-full font-semibold text-left text-gray-200 mb-4"
        >
            <div className="flex items-center">
              <SpeakerIcon className="w-5 h-5 mr-3 text-teal-400" />
              <span>Filter by Speaker</span>
            </div>
            <svg
                className={`w-5 h-5 transform transition-transform ${isSpeakersExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </button>

        {isSpeakersExpanded && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                <div className="flex items-center justify-between text-sm py-1 border-b border-gray-700">
                    <label htmlFor="toggle-all-speakers" className="text-gray-400 cursor-pointer">
                      {selectedSpeakers.length === speakers.length ? 'Deselect All' : 'Select All'}
                    </label>
                    <input 
                      id="toggle-all-speakers"
                      type="checkbox"
                      className="form-checkbox h-4 w-4 rounded bg-gray-700 border-gray-600 text-teal-500 focus:ring-teal-500"
                      checked={speakers.length > 0 && selectedSpeakers.length === speakers.length}
                      onChange={toggleAllSpeakers}
                    />
                </div>
                {speakers.map(speaker => (
                    <label key={speaker} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-700/50">
                        <input
                            type="checkbox"
                            value={speaker}
                            checked={selectedSpeakers.includes(speaker)}
                            onChange={handleSpeakerSelection}
                            className="form-checkbox h-5 w-5 rounded bg-gray-700 border-gray-600 text-teal-500 focus:ring-teal-500"
                        />
                        <span className="text-gray-300 truncate" title={speaker}>{speaker}</span>
                    </label>
                ))}
            </div>
        )}
      </div>

      {hasAnalysisResults && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="flex items-center font-semibold text-left text-gray-200 mb-4">
              Analysis Insights
          </h4>
          <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-700/50">
                  <input
                      type="checkbox"
                      checked={analysisFilter.isQuestion}
                      onChange={() => handleAnalysisFilterChange('isQuestion')}
                      className="form-checkbox h-5 w-5 rounded bg-gray-700 border-gray-600 text-sky-500 focus:ring-sky-500"
                  />
                  <QuestionIcon className="w-5 h-5 text-sky-400" />
                  <span className="text-gray-300">Show only Questions</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-gray-700/50">
                  <input
                      type="checkbox"
                      checked={analysisFilter.isActionItem}
                      onChange={() => handleAnalysisFilterChange('isActionItem')}
                      className="form-checkbox h-5 w-5 rounded bg-gray-700 border-gray-600 text-amber-500 focus:ring-amber-500"
                  />
                  <ActionItemIcon className="w-5 h-5 text-amber-400" />
                  <span className="text-gray-300">Show only Action Items</span>
              </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;
