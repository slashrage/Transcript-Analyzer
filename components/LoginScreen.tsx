import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (name: string, password: string) => Promise<boolean>;
  onNavigateToRegister: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onNavigateToRegister }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim() && password) {
      const success = await onLogin(name.trim(), password);
      if (!success) {
        setError('Invalid username or password.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-xl p-8">
          <h1 className="text-3xl font-bold text-center text-teal-400 mb-2">
            Transcript Analyzer
          </h1>
          <p className="text-center text-gray-400 mb-8">
            Please log in to continue.
          </p>
          <form onSubmit={handleSubmit}>
            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
            <div className="mb-4">
              <label htmlFor="name" className="sr-only">Your Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-lg"
                required
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition text-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 text-lg"
            >
              Login
            </button>
          </form>
          <p className="text-center text-gray-400 mt-6 text-sm">
            Don't have an account?{' '}
            <button onClick={onNavigateToRegister} className="font-semibold text-teal-400 hover:text-teal-300">
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;