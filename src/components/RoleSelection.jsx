import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function RoleSelection({ onSelect, notes, darkMode, onToggleDarkMode }) {
  // Lock body scroll while the role selection is visible and compensate for scrollbar width
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

  // Mouse parallax for card and buttons
  const cardRef = useRef(null);
  // Independent parallax transforms per element (card stays still)
  const [titleT, setTitleT] = useState('translate3d(0,0,0)');
  const [jamesT, setJamesT] = useState('translate3d(0,0,0)');
  const [bugT, setBugT] = useState('translate3d(0,0,0)');
  const [notesT, setNotesT] = useState('translate3d(0,0,0)');
  const [toggleT, setToggleT] = useState('translate3d(0,0,0)');
  const [helperT, setHelperT] = useState('translate3d(0,0,0)');

  const handleMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    // Subtle depth per element (translate only)
    const lim = 6; // px cap
    const baseX = Math.max(-lim, Math.min(lim, dx * 0.02));
    const baseY = Math.max(-lim, Math.min(lim, dy * 0.02));
    setTitleT(`translate3d(${baseX * 0.8}px, ${baseY * 0.8}px, 0)`);
    setJamesT(`translate3d(${baseX * 1.0}px, ${baseY * 1.0}px, 0)`);
    setBugT(`translate3d(${baseX * 0.9}px, ${baseY * 0.9}px, 0)`);
    setNotesT(`translate3d(${baseX * 0.5}px, ${baseY * 0.5}px, 0)`);
    setToggleT(`translate3d(${baseX * 1.1}px, ${baseY * 1.1}px, 0)`);
    setHelperT(`translate3d(${baseX * 0.4}px, ${baseY * 0.4}px, 0)`);
  };

  const handleLeave = () => {
    setTitleT('translate3d(0,0,0)');
    setJamesT('translate3d(0,0,0)');
    setBugT('translate3d(0,0,0)');
    setNotesT('translate3d(0,0,0)');
    setToggleT('translate3d(0,0,0)');
    setHelperT('translate3d(0,0,0)');
  };

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 ${
      darkMode ? 'bg-gradient-to-br from-black via-neutral-900 to-neutral-800' : 'bg-gradient-to-br from-white via-slate-50 to-gray-100'
    }`}>
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className={`backdrop-blur-lg rounded-3xl border-2 shadow-2xl p-10 m-2 flex flex-col items-center transition-colors duration-500 ${
          darkMode ? 'bg-neutral-900/80 border-neutral-700/60' : 'bg-white/80 border-gray-200'
        }`}
      >
        <div className="w-full">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600" style={{ transform: titleT, transition: 'transform 180ms ease-out', willChange: 'transform' }}>Who are you?</h2>
          <div className="flex flex-col md:flex-row gap-7 mb-7 w-full justify-center">
            <button
              className={`flex-1 px-10 py-6 text-2xl font-bold rounded-3xl transition-all duration-500 ease-in-out border-4 shadow-xl ${
                darkMode
                  ? 'text-neutral-200 bg-gradient-to-tr from-neutral-800 via-neutral-800 to-neutral-700 border-neutral-700 hover:border-neutral-500'
                  : 'text-white bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-700 border-transparent hover:border-blue-300'
              }`}
              onClick={() => onSelect('boyfriend')}
              style={{ letterSpacing: 2, transform: jamesT, transition: 'transform 180ms ease-out', willChange: 'transform' }}
            >
              James
            </button>
            <button
              className={`flex-1 px-10 py-6 text-2xl font-bold rounded-3xl transition-all duration-500 ease-in-out border-4 shadow-lg hover:scale-105 active:scale-98 ${
                darkMode
                  ? 'text-neutral-200 bg-gradient-to-tl from-neutral-800 via-neutral-900 to-black border-neutral-700 hover:border-neutral-500'
                  : 'border-transparent bg-gradient-to-tl from-pink-200 via-purple-100 to-indigo-100 text-pink-700 hover:border-pink-400'
              }`}
              onClick={() => onSelect('girlfriend')}
              style={{ letterSpacing: 2, transform: bugT, transition: 'transform 180ms ease-out', willChange: 'transform' }}
            >
              Bug ❤️
            </button>
          </div>
        </div>
        {notes && (
          <div className="mt-6 w-full max-w-2xl" style={{ transform: notesT, transition: 'transform 180ms ease-out', willChange: 'transform' }}>
            {notes}
          </div>
        )}
        <button
          onClick={onToggleDarkMode}
          className={`mt-4 p-2 rounded-full transition-all duration-500 ease-out shadow hover:scale-105 active:scale-95 ${
            darkMode ? 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          style={{ transform: toggleT, transition: 'transform 180ms ease-out', willChange: 'transform' }}
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <div className={`mt-2 italic text-sm text-center w-full flex justify-center items-center transition-colors duration-500 ${darkMode ? 'text-neutral-400' : 'text-gray-500'}`} style={{ transform: helperT, transition: 'transform 180ms ease-out', willChange: 'transform' }}>
          Your choice just affects which sections you see.<br/>
          You can switch any time!
        </div>
      </div>
    </div>
  );
}
