import React from 'react';

export default function PatchNotes({ darkMode }) {
  return (
    <div className={`backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border transition-colors duration-500 ${
      darkMode ? 'bg-neutral-900/90 border-neutral-700/60' : 'bg-white/80 border-white/20'
    }`}>
      <h2 className="text-2xl font-semibold mb-3">
        <span className={`bg-clip-text text-transparent ${
          darkMode ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gradient-to-r from-pink-600 to-purple-600'
        }`}>Patch Notes • v1.3</span> 🔐
      </h2>
      <div
        className={`${darkMode ? 'bg-black/30' : 'bg-white/40'} rounded-2xl px-4 py-2 h-44 md:h-52 overflow-y-auto transition-colors duration-500`}
        style={{ scrollbarGutter: 'stable' }}
      >
        <ul className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} list-disc pl-6 text-sm space-y-1 transition-colors duration-500`}>
          <li><strong>Major Security Update!</strong></li>
          <li>Password protection - shared access control</li>
          <li>Auto-logout after 15 min idle (2-min warning)</li>
          <li>Input validation with character limits (200/2000)</li>
          <li>XSS protection with DOMPurify sanitization</li>
          <li>Rate limiting: 30s submissions, 60s notifications</li>
          <li>CORS restricted to production domain only</li>
          <li>Content Security Policy headers added</li>
          <li>Real-time character counters on inputs</li>
          <li>Enhanced error messages with auto-dismiss</li>
          <li>Improved mobile touch event tracking</li>
        </ul>
      </div>
    </div>
  );
}
