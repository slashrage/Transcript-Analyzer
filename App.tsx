import React, { useState, useMemo, useCallback } from 'react';
import { parseTranscript } from './services/parser';
import { analyzeTranscript } from './services/geminiService';
import { analyzeProfanity } from './services/profanityService';
import type { TranscriptEntry, GeminiAnalysisResult, AnalyzedTranscriptEntry, ProfanityReport } from './types';
import FileUpload from './components/FileUpload';
import FilterControls from './components/FilterControls';
import TranscriptView from './components/TranscriptView';
import ProfanityTracker from './components/ProfanityTracker';

const App: React.FC = () => {
  const [transcript, setTranscript] = useState<TranscriptEntry[] | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Map<number, GeminiAnalysisResult> | null>(null);
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([]);
  const [analysisFilter, setAnalysisFilter] = useState({ isQuestion: false, isActionItem: false });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [profanityReport, setProfanityReport] = useState<ProfanityReport | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setTranscript(null);
    setAnalysisResults(null);
    setSpeakers([]);
    setSelectedSpeakers([]);
    setFileName(file.name);
    setSearchTerm('');
    setProfanityReport(null);

    try {
      // Use a short timeout to allow the loading spinner to render
      await new Promise(resolve => setTimeout(resolve, 50));

      const content = await file.text();
      const { entries, speakers: parsedSpeakers } = parseTranscript(content);
      
      if (entries.length === 0) {
        throw new Error("Could not parse any entries from the file. Please check the format.");
      }

      setTranscript(entries);
      setSpeakers(parsedSpeakers);
      setSelectedSpeakers(parsedSpeakers); // Select all speakers by default
      
      // Non-AI based profanity analysis
      const profanityData = analyzeProfanity(entries);
      setProfanityReport(profanityData);

      try {
        const analysisData = await analyzeTranscript(entries);
        const analysisMap = new Map<number, GeminiAnalysisResult>();
        analysisData.forEach(item => analysisMap.set(item.id, item));
        setAnalysisResults(analysisMap);
      } catch (analysisError) {
        const message = analysisError instanceof Error ? analysisError.message : 'An unknown error occurred';
        setError(`AI analysis failed: ${message}. You can still view the transcript.`);
        console.error('Gemini analysis failed:', analysisError);
      }

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to process transcript: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzedTranscript: AnalyzedTranscriptEntry[] = useMemo(() => {
    if (!transcript) return [];
    return transcript.map(entry => ({
      ...entry,
      ...analysisResults?.get(entry.id),
    }));
  }, [transcript, analysisResults]);

  const filteredTranscript = useMemo(() => {
    return analyzedTranscript.filter(entry => {
        const speakerMatch = selectedSpeakers.length === 0 || selectedSpeakers.includes(entry.speaker);
        if (!speakerMatch) return false;

        if (analysisFilter.isQuestion && !entry.isQuestion) return false;
        if (analysisFilter.isActionItem && !entry.isActionItem) return false;
        
        const searchMatch = searchTerm.trim() === '' || entry.text.toLowerCase().includes(searchTerm.toLowerCase());
        if (!searchMatch) return false;

        return true;
    });
  }, [analyzedTranscript, selectedSpeakers, analysisFilter, searchTerm]);
  
  const resetState = () => {
    setTranscript(null);
    setAnalysisResults(null);
    setSpeakers([]);
    setSelectedSpeakers([]);
    setAnalysisFilter({ isQuestion: false, isActionItem: false });
    setIsLoading(false);
    setError(null);
    setFileName('');
    setSearchTerm('');
    setProfanityReport(null);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-teal-400">Transcript Analyzer</h1>
          {transcript && <button onClick={resetState} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">New Transcript</button>}
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!transcript && !isLoading && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-center mb-4 text-white">Upload and Analyze Your Meeting Transcript</h2>
            <p className="text-center text-gray-400 mb-8">Supports .vtt and .txt files. Your transcript will be parsed and analyzed for key insights like questions and action items.</p>
            <FileUpload onFileUpload={handleFileUpload} />
          </div>
        )}
        
        {isLoading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-300">Processing and analyzing transcript...</p>
          </div>
        )}

        {error && (
            <div className="max-w-2xl mx-auto bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline ml-2">{error}</span>
                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <span className="text-2xl">&times;</span>
                </button>
            </div>
        )}

        {transcript && !isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="lg:col-span-3">
                <FilterControls
                    speakers={speakers}
                    selectedSpeakers={selectedSpeakers}
                    onSpeakerChange={setSelectedSpeakers}
                    analysisFilter={analysisFilter}
                    onAnalysisFilterChange={setAnalysisFilter}
                    hasAnalysisResults={!!analysisResults}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                />
                {profanityReport && <ProfanityTracker report={profanityReport} />}
            </aside>
            <div className="lg:col-span-9">
                <TranscriptView transcript={filteredTranscript} fileName={fileName} totalEntries={transcript.length} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;