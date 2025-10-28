import React, { useState } from 'react';
import patchNotes from '../patchNotes.json';

export default function PatchNotes({ darkMode }) {
  const versions = Array.isArray(patchNotes?.versions) && patchNotes.versions.length > 0
    ? patchNotes.versions
    : [{ version: '1.0', date: '', items: ['Minor improvements'] }];
  
  const latestVersion = versions[0]?.version || '1.0';
  const [expandedVersions, setExpandedVersions] = useState(new Set([latestVersion]));

  const toggleVersion = (version) => {
    setExpandedVersions(prev => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  };

  return (
    <div className={`backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border transition-colors duration-500 ${
      darkMode ? 'bg-neutral-900/90 border-neutral-700/60' : 'bg-white/80 border-white/20'
    }`}>
      <h2 className="text-2xl font-semibold mb-3">
        <span className={`bg-clip-text text-transparent ${
          darkMode ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gradient-to-r from-pink-600 to-purple-600'
        }`}>Latest Changes • v{latestVersion}</span>
      </h2>
      <div
        className={`${darkMode ? 'bg-black/30' : 'bg-white/40'} rounded-2xl px-4 py-2 h-44 md:h-52 overflow-y-auto transition-colors duration-500`}
        style={{ scrollbarGutter: 'stable' }}
      >
        {versions.map((version, versionIdx) => {
          const isExpanded = expandedVersions.has(version.version);
          const isLatest = versionIdx === 0;
          
          return (
            <div key={version.version} className={versionIdx > 0 ? 'mt-3' : ''}>
              <button
                onClick={() => toggleVersion(version.version)}
                className={`flex items-center gap-2 font-bold text-sm mb-1 w-full text-left hover:opacity-80 transition-opacity ${
                  darkMode ? 'text-pink-300' : 'text-pink-600'
                }`}
              >
                <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
                <span>v{version.version}</span>
                {isLatest && <span className="text-xs opacity-70">(Current)</span>}
              </button>
              {isExpanded && (
                <ul className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} list-disc pl-6 text-sm space-y-1 transition-colors duration-500`}>
                  {version.items?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
