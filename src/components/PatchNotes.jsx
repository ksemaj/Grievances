import React from 'react';

export default function PatchNotes({ darkMode }) {
  return (
    <div className={`backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border transition-colors duration-500 ${
      darkMode ? 'bg-neutral-900/90 border-neutral-700/60' : 'bg-white/80 border-white/20'
    }`}>
      <h2 className="text-2xl font-semibold mb-3">
        <span className={`bg-clip-text text-transparent ${
          darkMode ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gradient-to-r from-pink-600 to-purple-600'
        }`}>Patch Notes • v2.0</span> ⚡
      </h2>
      <div
        className={`${darkMode ? 'bg-black/30' : 'bg-white/40'} rounded-2xl px-4 py-2 h-44 md:h-52 overflow-y-auto transition-colors duration-500`}
        style={{ scrollbarGutter: 'stable' }}
      >
        <ul className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} list-disc pl-6 text-sm space-y-1 transition-colors duration-500`}>
          <li><strong>Vite Migration - 30x Faster!</strong></li>
          <li>Build time: ~30s → ~1s with Vite 7</li>
          <li>Zero vulnerabilities (down from 9!)</li>
          <li>Modular code structure for better maintainability</li>
          <li>Components extracted to separate files</li>
          <li>Utilities and constants organized</li>
          <li>Safe HTML formatting now allowed (bold, italic, etc.)</li>
          <li>Delete confirmation prevents accidents</li>
          <li>Notification validation (no empty submissions)</li>
          <li>Fixed AFK timer dependency bug</li>
          <li>Environment variable validation on startup</li>
        </ul>
      </div>
    </div>
  );
}
