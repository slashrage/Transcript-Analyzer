import React from 'react';
import type { SavedTranscript } from '../types';
import FileUpload from './FileUpload';
import SavedTranscripts from './SavedTranscripts';

interface DashboardProps {
  onFileUpload: (file: File) => void;
  savedTranscripts: SavedTranscript[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onFileUpload, savedTranscripts, onLoad, onDelete }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-gray-800/30 p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-4">Start a New Analysis</h2>
        <p className="text-gray-400 mb-6">Upload a .vtt or .txt file to get started.</p>
        <FileUpload onFileUpload={onFileUpload} />
      </div>
      <div className="bg-gray-800/30 p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-4">Your Saved Transcripts</h2>
        <SavedTranscripts 
            transcripts={savedTranscripts}
            onLoad={onLoad}
            onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default Dashboard;