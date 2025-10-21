
import React, { useCallback, useState } from 'react';
import UploadIcon from './icons/UploadIcon';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };
  
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          onFileUpload(e.dataTransfer.files[0]);
      }
  }, [onFileUpload]);

  return (
    <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${isDragging ? 'border-teal-400 bg-gray-700/50' : 'border-gray-600 hover:border-teal-500 hover:bg-gray-800'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".vtt,.txt"
        onChange={handleFileChange}
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
        <UploadIcon className="w-12 h-12 text-gray-500 mb-4" />
        <p className="font-semibold text-lg text-gray-200">
          <span className="text-teal-400">Click to upload</span> or drag and drop
        </p>
        <p className="text-sm text-gray-500 mt-1">VTT or TXT file</p>
      </label>
    </div>
  );
};

export default FileUpload;
