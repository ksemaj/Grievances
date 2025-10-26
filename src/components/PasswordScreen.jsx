import React, { useState, useEffect } from 'react';
import { Lock, Sun, Moon } from 'lucide-react';
import { getAccessPassword } from '../services/supabase';

export default function PasswordScreen({ onAuthenticated, darkMode, onToggleDarkMode }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow || '';
      document.body.style.paddingRight = previousPaddingRight || '';
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      const correctPassword = getAccessPassword();

      if (password === correctPassword) {
        sessionStorage.setItem('authenticated', 'true');
        onAuthenticated();
      } else {
        setError('Incorrect password');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-center ${
      darkMode ? 'bg-gradient-to-br from-black via-neutral-900 to-neutral-800' : 'bg-gradient-to-br from-white via-slate-50 to-gray-100'
    }`}>
      <div className={`backdrop-blur-lg rounded-3xl border-2 shadow-2xl p-10 m-2 w-full max-w-md ${
        darkMode ? 'bg-neutral-900/80 border-neutral-700/60' : 'bg-white/80 border-gray-200'
      } ${isShaking ? 'animate-shake' : ''}`}>
        <div className="flex flex-col items-center mb-6">
          <Lock className={`w-16 h-16 mb-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600">
            Enter Password
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            This portal is private
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Enter password"
            autoFocus
            className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 outline-none ${
              darkMode
                ? 'border-purple-700 bg-neutral-800 text-white placeholder-gray-400'
                : 'border-purple-200 bg-white text-gray-900 placeholder-gray-500'
            } ${error ? 'border-red-500' : ''}`}
          />

          {error && (
            <p className={`mt-2 text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Unlock
          </button>
        </form>

        <button
          onClick={onToggleDarkMode}
          className={`mt-6 w-full p-2 rounded-full transition-all duration-300 shadow ${
            darkMode ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} className="mx-auto" /> : <Moon size={20} className="mx-auto" />}
        </button>
      </div>
    </div>
  );
}
