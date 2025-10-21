import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { parseTranscript } from './services/parser';
import { analyzeTranscript } from './services/geminiService';
import { analyzeProfanity } from './services/profanityService';
import { hashPassword, verifyPassword } from './services/authService';
import type { TranscriptEntry, GeminiAnalysisResult, AnalyzedTranscriptEntry, ProfanityReport, User, SavedTranscript } from './types';
import FilterControls from './components/FilterControls';
import TranscriptView from './components/TranscriptView';
import ProfanityTracker from './components/ProfanityTracker';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import RegistrationScreen from './components/RegistrationScreen';
import SaveIcon from './components/icons/SaveIcon';

type View = 'login' | 'register' | 'dashboard';

const App: React.FC = () => {
  // Transcript State
  const [transcript, setTranscript] = useState<TranscriptEntry[] | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Map<number, GeminiAnalysisResult> | null>(null);
  const [speakers, setSpeakers] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [profanityReport, setProfanityReport] = useState<ProfanityReport | null>(null);
  
  // UI State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Filter State
  const [selectedSpeakers, setSelectedSpeakers] = useState<string[]>([]);
  const [analysisFilter, setAnalysisFilter] = useState({ isQuestion: false, isActionItem: false });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth & Saved Data State
  const [currentView, setCurrentView] = useState<View>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedTranscripts, setSavedTranscripts] = useState<SavedTranscript[]>([]);
  
  // Check for logged in user on initial load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('transcript_analyzer_session');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        setCurrentUser(user);
        setCurrentView('dashboard');
        loadSavedTranscriptsForUser(user.name);
      }
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('transcript_analyzer_session');
    }
  }, []);

  const loadSavedTranscriptsForUser = (username: string) => {
    try {
        const storedTranscripts = localStorage.getItem(`saved_transcripts_${username}`);
        if (storedTranscripts) {
            const parsed = JSON.parse(storedTranscripts, (key, value) => {
                if (key === 'analysisResults' && value !== null) {
                    return new Map(value);
                }
                return value;
            });
            setSavedTranscripts(parsed);
        }
    } catch (e) {
        console.error("Failed to parse saved transcripts from localStorage", e);
    }
  };
  
  const handleRegister = async (name: string, password: string): Promise<{ success: boolean; message: string }> => {
    const storedUsers = localStorage.getItem('transcript_analyzer_users');
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

    if (users.find(u => u.name.toLowerCase() === name.toLowerCase())) {
      return { success: false, message: 'Username already exists.' };
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = { name, passwordHash };
    users.push(newUser);
    localStorage.setItem('transcript_analyzer_users', JSON.stringify(users));
    
    // Automatically log in the new user
    localStorage.setItem('transcript_analyzer_session', JSON.stringify(newUser));
    setCurrentUser(newUser);
    setCurrentView('dashboard');
    loadSavedTranscriptsForUser(newUser.name);
    
    return { success: true, message: 'Registration successful!' };
  };

  const handleLogin = async (name: string, password: string): Promise<boolean> => {
    const storedUsers = localStorage.getItem('transcript_analyzer_users');
    if (!storedUsers) return false;

    const users: User[] = JSON.parse(storedUsers);
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

    if (user && await verifyPassword(password, user.passwordHash)) {
      localStorage.setItem('transcript_analyzer_session', JSON.stringify(user));
      setCurrentUser(user);
      setCurrentView('dashboard');
      loadSavedTranscriptsForUser(user.name);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('transcript_analyzer_session');
    setCurrentUser(null);
    setCurrentView('login');
    resetState();
  };

  const handleFileUpload = useCallback(async (file: File) => {
    resetState(true); // Keep auth state
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      const content = await file.text();
      const { entries, speakers: parsedSpeakers } = parseTranscript(content);
      
      if (entries.length === 0) throw new Error("Could not parse any entries from the file.");
      
      setTranscript(entries);
      setSpeakers(parsedSpeakers);
      setSelectedSpeakers(parsedSpeakers);
      setFileName(file.name);
      
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
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to process transcript: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzedTranscript: AnalyzedTranscriptEntry[] = useMemo(() => {
    if (!transcript) return [];
    return transcript.map(entry => ({ ...entry, ...analysisResults?.get(entry.id) }));
  }, [transcript, analysisResults]);

  const filteredTranscript = useMemo(() => {
    return analyzedTranscript.filter(entry => {
        if (selectedSpeakers.length > 0 && !selectedSpeakers.includes(entry.speaker)) return false;
        if (analysisFilter.isQuestion && !entry.isQuestion) return false;
        if (analysisFilter.isActionItem && !entry.isActionItem) return false;
        if (searchTerm.trim() !== '' && !entry.text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });
  }, [analyzedTranscript, selectedSpeakers, analysisFilter, searchTerm]);
  
  const resetState = (keepAuth = false) => {
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
    setIsSaved(false);
    if (!keepAuth) {
        setCurrentView('login');
        setCurrentUser(null);
        setSavedTranscripts([]);
    }
  }

  const handleSaveTranscript = () => {
    if (!currentUser || !transcript) return;
    const newSave: SavedTranscript = {
        id: new Date().toISOString(),
        fileName,
        savedAt: new Date().toLocaleString(),
        data: {
            transcript,
            analysisResults,
            speakers,
            profanityReport,
        }
    };
    const updatedTranscripts = [...savedTranscripts, newSave];
    localStorage.setItem(`saved_transcripts_${currentUser.name}`, JSON.stringify(updatedTranscripts, (key, value) => {
        if (value instanceof Map) {
            return Array.from(value.entries());
        }
        return value;
    }));
    setSavedTranscripts(updatedTranscripts);
    setIsSaved(true);
  };

  const handleLoadTranscript = (id: string) => {
    const saved = savedTranscripts.find(t => t.id === id);
    if (saved) {
        resetState(true);
        setFileName(saved.fileName);
        setTranscript(saved.data.transcript);
        setAnalysisResults(saved.data.analysisResults);
        setSpeakers(saved.data.speakers);
        setSelectedSpeakers(saved.data.speakers);
        setProfanityReport(saved.data.profanityReport);
        setIsSaved(true);
    }
  };
  
  const handleDeleteTranscript = (id: string) => {
      if (!currentUser || !window.confirm("Are you sure you want to delete this transcript?")) return;
      const updatedTranscripts = savedTranscripts.filter(t => t.id !== id);
      localStorage.setItem(`saved_transcripts_${currentUser.name}`, JSON.stringify(updatedTranscripts));
      setSavedTranscripts(updatedTranscripts);
  };

  if (currentView === 'login') {
    return <LoginScreen onLogin={handleLogin} onNavigateToRegister={() => setCurrentView('register')} />;
  }
  
  if (currentView === 'register') {
    return <RegistrationScreen onRegister={handleRegister} onNavigateToLogin={() => setCurrentView('login')} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-teal-400">Transcript Analyzer</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, <strong className="font-semibold text-white">{currentUser?.name}</strong>!</span>
            {transcript && (
              <>
                <button 
                  onClick={handleSaveTranscript} 
                  disabled={isSaved}
                  className={`flex items-center gap-2 font-bold py-2 px-4 rounded-lg transition duration-300 ${isSaved ? 'bg-gray-600 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'}`}
                >
                  <SaveIcon className="w-5 h-5" /> {isSaved ? 'Saved' : 'Save'}
                </button>
                <button onClick={() => resetState(true)} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300">New Transcript</button>
              </>
            )}
            <button onClick={handleLogout} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Logout</button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!transcript && !isLoading && (
            <Dashboard 
                onFileUpload={handleFileUpload}
                savedTranscripts={savedTranscripts}
                onLoad={handleLoadTranscript}
                onDelete={handleDeleteTranscript}
            />
        )}
        
        {isLoading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500 mx-auto mb-4"></div>
            <p className="text-xl font-semibold text-gray-300">Processing and analyzing transcript...</p>
          </div>
        )}

        {error && (
            <div className="max-w-3xl mx-auto bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative my-4" role="alert">
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