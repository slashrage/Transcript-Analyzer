import React from 'react';
import type { SavedTranscript } from '../types';
import TrashIcon from './icons/TrashIcon';

interface SavedTranscriptsProps {
  transcripts: SavedTranscript[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

const SavedTranscripts: React.FC<SavedTranscriptsProps> = ({ transcripts, onLoad, onDelete }) => {
  if (transcripts.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">You have no saved transcripts.</p>
        <p className="text-gray-500 text-sm mt-1">Upload a new transcript to save it here.</p>
      </div>
    );
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent onLoad from firing
    onDelete(id);
  }

  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
      {transcripts.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime()).map((transcript) => (
        <div
          key={transcript.id}
          onClick={() => onLoad(transcript.id)}
          className="bg-gray-700/50 hover:bg-gray-700 p-4 rounded-lg cursor-pointer transition-all flex justify-between items-center"
        >
          <div>
            <p className="font-semibold text-teal-300 truncate" title={transcript.fileName}>{transcript.fileName}</p>
            <p className="text-xs text-gray-500">Saved: {transcript.savedAt}</p>
          </div>
          <button 
            onClick={(e) => handleDelete(e, transcript.id)}
            className="text-gray-500 hover:text-red-400 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label={`Delete transcript ${transcript.fileName}`}
            title="Delete Transcript"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default SavedTranscripts;