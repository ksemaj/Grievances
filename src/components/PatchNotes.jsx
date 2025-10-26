import React from 'react';
import patchNotes from '../patchNotes.json';

export default function PatchNotes({ darkMode }) {
  const latest = Array.isArray(patchNotes?.versions) && patchNotes.versions.length > 0
    ? patchNotes.versions[0]
    : { version: '1.0', date: '', items: ['Minor improvements'] };

  return (
    <div className={`backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border transition-colors duration-500 ${
      darkMode ? 'bg-neutral-900/90 border-neutral-700/60' : 'bg-white/80 border-white/20'
    }`}>
      <h2 className="text-2xl font-semibold mb-3">
        <span className={`bg-clip-text text-transparent ${
          darkMode ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gradient-to-r from-pink-600 to-purple-600'
        }`}>Patch Notes • v{latest.version}</span>
      </h2>
      <div
        className={`${darkMode ? 'bg-black/30' : 'bg-white/40'} rounded-2xl px-4 py-2 h-44 md:h-52 overflow-y-auto transition-colors duration-500`}
        style={{ scrollbarGutter: 'stable' }}
      >
        <ul className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} list-disc pl-6 text-sm space-y-1 transition-colors duration-500`}>
          {latest.items?.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
