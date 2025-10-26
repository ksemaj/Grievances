import React from 'react';

/**
 * Reusable crossfade transition wrapper
 * @param {boolean} show - Whether to show the component
 * @param {boolean} fadingOut - Whether the component is fading out
 * @param {boolean} overlay - Whether to render as a fixed overlay
 * @param {React.ReactNode} children - Child components
 */
export default function StackFade({ show, fadingOut, overlay, children }) {
  if (!show) return null;

  const base = `transition-[opacity,transform] duration-700 ease-out ${
    fadingOut ? 'opacity-0 scale-95 translate-y-1 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'
  }`;

  if (overlay) {
    return (
      <div className={`fixed inset-0 z-50 ${base}`} style={{ willChange: 'opacity, transform' }}>
        {children}
      </div>
    );
  }

  return (
    <div className={base} style={{ willChange: 'opacity, transform' }}>
      {children}
    </div>
  );
}
