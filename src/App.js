import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AlertCircle, Send, Trash2, RefreshCw, Sun, Moon } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// --- In-app Notification Component ---
// REMOVE the Notification component entirely

const ROLE_KEY = 'grievanceRole';

const FADE_DURATION = 500; // ms

// Helper to safely stack screens
function StackFade({ show, children, fadingOut, overlay }) {
  // overlay === true => fixed overlay (Role Selection), false => normal flow (Portal)
  if (!show) return null;
  if (overlay) {
    return <div className={`fixed inset-0 w-full h-full z-50 overflow-hidden transition-opacity duration-500 ease-out ${fadingOut ? 'opacity-0' : 'opacity-100'}`} style={{ pointerEvents: fadingOut ? 'none' : 'auto', willChange: 'opacity' }}>
      {children}
    </div>;
  }
  // No stacking for portal: let scroll pass through
  return <div className={`transition-opacity duration-500 ease-out ${fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} style={{ willChange: 'opacity' }}>{children}</div>;
}

function RoleSelection({ onSelect }) {
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

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center">
      <div className="backdrop-blur-lg bg-white/70 rounded-3xl border-2 border-pink-200 shadow-2xl p-10 m-2 flex flex-col items-center animate-glow transition-all duration-700 ease-in-out">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600">Who are you?</h2>
        <div className="flex flex-col md:flex-row gap-7 mb-7 w-full justify-center">
          <button
            className="flex-1 px-10 py-6 text-2xl font-bold rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-400 to-pink-600 hover:scale-105 active:scale-98 focus:outline-none shadow-xl text-white transition-all duration-300 ease-in-out border-4 border-transparent hover:border-indigo-300"
            onClick={() => onSelect('boyfriend')}
            style={{ letterSpacing: 2 }}
          >
            James
          </button>
          <button
            className="flex-1 px-10 py-6 text-2xl font-bold rounded-3xl bg-gradient-to-tl from-pink-200 via-purple-100 to-indigo-100 hover:scale-105 active:scale-98 focus:outline-none shadow-lg text-pink-700 transition-all duration-300 ease-in-out border-4 border-transparent hover:border-pink-400"
            onClick={() => onSelect('girlfriend')}
            style={{ letterSpacing: 2 }}
          >
            Bug ❤️
          </button>
        </div>
        <div className="mt-2 italic text-gray-500 text-sm text-center w-full flex justify-center items-center">
          Your choice just affects which sections you see.<br/>
          You can switch any time!
        </div>
      </div>
    </div>
  );
}

export default function GrievancePortal() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', severity: 'minor' });
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || null);
  // Crossfade state
  const [transitioning, setTransitioning] = useState(false);
  const [outgoing, setOutgoing] = useState(null); // 'role' or null
  const [incoming, setIncoming] = useState(null); // desired role or null

  // James's Discord user ID
  const DISCORD_USER_ID = "217849233133404161";

  // Load grievances from database
  const loadGrievances = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('grievances')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading grievances:', error);
    } else {
      setGrievances(data);
    }
    setLoading(false);
  };

  // Load grievances when component mounts
  useEffect(() => {
    loadGrievances();
  }, []);

  const handleSubmit = async () => {
    if (formData.title.trim() && formData.description.trim()) {
      const newGrievance = {
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        status: 'Under Review'
      };

      const { error } = await supabase
        .from('grievances')
        .insert([newGrievance]);

      if (error) {
        console.error('Error submitting grievance:', error);
        alert('Failed to submit grievance. Please try again.');
      } else {
        setFormData({ title: '', description: '', severity: 'minor' });
        loadGrievances(); // Reload to show new grievance
      }
    }
  };

  const deleteGrievance = async (id) => {
    const { error } = await supabase
      .from('grievances')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting grievance:', error);
    } else {
      loadGrievances(); // Reload after deletion
    }
  };

  // REMOVE the unused toggleDarkMode function

  const getSeverityColor = (severity) => {
    if (darkMode) {
      switch(severity) {
        case 'critical': return 'bg-gradient-to-br from-red-900/30 to-pink-900/30 text-red-200 border-red-800 shadow-red-800/20';
        case 'major': return 'bg-gradient-to-br from-orange-900/30 to-pink-900/30 text-orange-200 border-orange-800 shadow-orange-800/20';
        case 'minor': return 'bg-gradient-to-br from-yellow-900/30 to-pink-900/30 text-yellow-200 border-yellow-800 shadow-yellow-800/20';
        default: return 'bg-gradient-to-br from-gray-800/30 to-pink-900/20 text-gray-200 border-gray-700 shadow-gray-800/20';
      }
    } else {
      switch(severity) {
        case 'critical': return 'bg-gradient-to-br from-red-100 to-pink-100 text-red-800 border-red-200 shadow-red-200';
        case 'major': return 'bg-gradient-to-br from-orange-100 to-pink-100 text-orange-800 border-orange-200 shadow-orange-200';
        case 'minor': return 'bg-gradient-to-br from-yellow-100 to-pink-100 text-yellow-800 border-yellow-200 shadow-yellow-200';
        default: return 'bg-gradient-to-br from-gray-100 to-pink-50 text-gray-800 border-gray-200 shadow-gray-200';
      }
    }
  };

  // --- NEW: Mark grievance complete ---
  const markCompleted = async (id, completed) => {
    // This assumes a 'completed' bool column exists in Supabase,
    // otherwise fallback to status, or show UI only
    const { error } = await supabase
      .from('grievances')
      .update({ completed })
      .eq('id', id);
    if (error) {
      alert("Failed to update grievance.\n\nSchema may be missing 'completed' boolean.");
      return;
    }
    loadGrievances();
  };

  // --- NEW: Split active/completed grievances ---
  const activeGrievances = grievances.filter(g => !g.completed && g.status !== 'Completed');
  const completedGrievances = grievances.filter(g => g.completed || g.status === 'Completed');

  //--- Role selection/persistence with crossfade ---
  const handleRoleSelect = newRole => {
    setIncoming(newRole);
    setOutgoing(role); // role is null initially
    setTransitioning(true);
    setTimeout(() => {
      setRole(newRole);
      localStorage.setItem(ROLE_KEY, newRole);
      setTransitioning(false);
      setOutgoing(null);
      setIncoming(null);
    }, FADE_DURATION);
  };
  const handleRoleSwitch = () => {
    setOutgoing(role);
    setIncoming(null);
    setTransitioning(true);
    setTimeout(() => {
      setRole(null);
      localStorage.removeItem(ROLE_KEY);
      setTransitioning(false);
      setOutgoing(null);
      setIncoming(null);
    }, FADE_DURATION);
  };

  // Discord notification handlers
  const notifyBoyfriend = async () => {
    try {
      const { error } = await supabase.functions.invoke("notify-discord", {
        body: {
          userId: DISCORD_USER_ID,
          type: "notify",
          title: formData.title,
          description: formData.description
        }
      });
      if (error) throw error;
      alert("Notified successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to notify. Check function logs.");
    }
  };

  const attentionPing = async () => {
    try {
      const { error } = await supabase.functions.invoke("notify-discord", {
        body: {
          userId: DISCORD_USER_ID,
          type: "attention",
          title: formData.title,
          description: formData.description
        }
      });
      if (error) throw error;
      alert("Attention ping sent.");
    } catch (e) {
      console.error(e);
      alert("Failed to send attention ping.");
    }
  };

  //--- PHASE: Which screens to render for crossfade ---
  const renderPortal = (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900' : ''}`}>  
      <div className="max-w-4xl mx-auto transition-opacity duration-500 ease-out opacity-100">
        <div className="flex justify-between items-start mb-8">
          <button
            onClick={handleRoleSwitch}
            className={`transition-all px-4 py-2 rounded-2xl text-sm mt-2 border font-bold shadow hover:scale-105 active:scale-100 z-30 focus:outline-none ${darkMode ? 'bg-pink-900/30 text-pink-200 border-pink-700 hover:bg-pink-800/60' : 'bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200'}`}
            style={{letterSpacing:2}}
            title="Switch role? You can show or hide completed grievances.">
              Switch Role
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-all duration-300 ${darkMode ? 'bg-pink-300 hover:bg-pink-200 text-pink-800' : 'bg-gray-800 hover:bg-gray-700 text-white'} shadow-lg hover:scale-110`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        <div className="text-center mb-8">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 hover:scale-110 transition-transform duration-300 animate-float ${
            darkMode ? 'text-purple-400' : 'text-purple-600'
          }`} style={{
            filter: `drop-shadow(0 0 8px ${darkMode ? 'rgba(147, 51, 234, 0.4)' : 'rgba(147, 51, 234, 0.3)'})`
          }} />
          <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-sm">
            <span className={`bg-clip-text text-transparent ${
              darkMode 
                ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400' 
                : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600'
            }`}>Ally's Grievance Portal</span>
          </h1>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Please tell me how you feel. 💕</p>
        </div>

        <div className={`backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border hover:shadow-2xl transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800/80 border-gray-700/50' 
            : 'bg-white/80 border-white/20'
        }`}>
          <h2 className="text-2xl font-semibold mb-4">
            <span className={`bg-clip-text text-transparent ${
              darkMode 
                ? 'bg-gradient-to-r from-pink-400 to-purple-400' 
                : 'bg-gradient-to-r from-pink-600 to-purple-600'
            }`}>Submit New Grievance</span>
          </h2>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                The Incident... 🚨
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 outline-none ${
                  darkMode 
                    ? 'border-pink-700 hover:border-pink-600 bg-gradient-to-r from-gray-800 to-purple-900 text-white placeholder-gray-400' 
                    : 'border-pink-200 hover:border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="e.g., Let me open the door for myself."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Your point of view 💭
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 resize-none outline-none ${
                  darkMode 
                    ? 'border-pink-700 hover:border-pink-600 bg-gradient-to-r from-gray-800 to-purple-900 text-white placeholder-gray-400' 
                    : 'border-pink-200 hover:border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Describe the grievance in detail..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Severity Level
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: e.target.value})}
                className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-white focus:border-white transition-all duration-300 outline-none ${
                  darkMode 
                    ? 'border-pink-700 hover:border-pink-600 bg-gray-800 text-white' 
                    : 'border-pink-200 hover:border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 text-gray-900'
                }`}
                style={{
                  colorScheme: darkMode ? 'dark' : 'light',
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${darkMode ? '%23d1d5db' : '%23374151'}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.75rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.25em 1.25em'
                }}
              >
                <option value="minor">Minor Annoyance</option>
                <option value="major">Major Issue</option>
                <option value="critical">CRITICAL OFFENSE 😡</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <Send size={20} />
              Submit Grievance
            </button>
          </div>
          
          {/* Discord notification buttons */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={notifyBoyfriend}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Notify Boyfriend
            </button>
            <button
              onClick={attentionPing}
              className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-2xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Attention Button
            </button>
          </div>
        </div>

        {/* --- FILED (ACTIVE) GRIEVANCES --- */}
        <div className={`backdrop-blur-sm rounded-3xl shadow-xl p-6 border hover:shadow-2xl transition-all duration-400 ease-in-out ${darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-white/20'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              <span className={`bg-clip-text text-transparent ${
                darkMode 
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400' 
                  : 'bg-gradient-to-r from-pink-600 to-purple-600'
              }`}>Filed Grievances ({activeGrievances.length})</span>
            </h2>
            <button
              onClick={loadGrievances}
              className={`flex items-center gap-2 hover:scale-110 transition-all duration-300 px-3 py-2 rounded-xl ${
                darkMode 
                  ? 'text-purple-400 hover:text-purple-300 bg-gray-700 hover:bg-gray-600' 
                  : 'text-purple-600 hover:text-purple-700 bg-pink-50 hover:bg-pink-100'
              }`}
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4 ${
                darkMode ? 'border-pink-400' : 'border-pink-500'
              }`}></div>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Loading grievances... ✨</p>
            </div>
          ) : activeGrievances.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🌸</div>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No active grievances. Things are ok.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGrievances.map((grievance) => (
                <div
                  key={grievance.id}
                  className={`border-2 rounded-2xl p-5 ${getSeverityColor(grievance.severity)} hover:shadow-lg transition-all duration-300 hover:scale-105 transform backdrop-blur-sm ${
                    darkMode ? 'bg-gray-800/70' : 'bg-white/70'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{grievance.title}</h3>
                    <div className="flex gap-2">
                      <button onClick={() => markCompleted(grievance.id, true)} className={`${darkMode ? 'bg-green-900/40 text-green-300 hover:bg-green-700/60' : 'bg-green-100 text-green-800 hover:bg-green-300'} px-3 py-1 rounded-lg mr-2 transition-all duration-200 font-semibold`}>✓ Complete</button>
                      <button onClick={() => deleteGrievance(grievance.id)} className={`transition-all duration-300 hover:scale-110 p-1 rounded-lg ${darkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' : 'text-gray-600 hover:text-red-600 hover:bg-red-50'}`}><Trash2 size={18} /></button>
                    </div>
                  </div>
                  <p className={`text-sm mb-4 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{grievance.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold uppercase px-3 py-1 rounded-full ${darkMode ? 'bg-gradient-to-r from-pink-900/50 to-purple-900/50 text-purple-300' : 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700'}`}>{grievance.severity} • {grievance.status}</span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{new Date(grievance.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- COMPLETED GRIEVANCES --- */}
        {role === 'boyfriend' && (
          <div className={`mt-8 backdrop-blur-sm rounded-3xl shadow-lg p-6 border hover:shadow-2xl transition-all duration-500 ease-in-out ${darkMode ? 'bg-gray-900/80 border-green-900/40' : 'bg-green-50/70 border-green-300/30'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">
                <span className={`bg-clip-text text-transparent ${darkMode ? 'bg-gradient-to-r from-lime-400 to-green-300' : 'bg-gradient-to-r from-green-500 to-lime-500'}`}>Completed Grievances ({completedGrievances.length})</span>
              </h2>
            </div>
            {completedGrievances.length === 0 ? (
              <div className="text-center py-8 opacity-70">
                <div className="text-5xl mb-4">🍃</div>
                <p className="text-lg">No completed grievances yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedGrievances.map(grievance => (
                  <div key={grievance.id} className={`border-2 rounded-2xl p-5 ${getSeverityColor(grievance.severity)} hover:shadow-md transition-all duration-300 hover:scale-102 transform backdrop-blur-sm opacity-70 ${darkMode ? 'bg-gray-700/70' : 'bg-green-100/60 border-green-200'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{grievance.title}</h3>
                      <button onClick={() => markCompleted(grievance.id, false)} className={`${darkMode ? 'bg-yellow-900/40 text-yellow-300 hover:bg-yellow-700/60' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-300'} px-3 py-1 rounded-lg transition-all duration-200 font-semibold`}>↩ Back to Open</button>
                    </div>
                    <p className={`text-sm mb-4 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{grievance.description}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-semibold uppercase px-3 py-1 rounded-full ${darkMode ? 'bg-gradient-to-r from-green-900/30 to-pink-900/10 text-green-200' : 'bg-gradient-to-r from-green-200 to-pink-100 text-green-700'}`}>{grievance.severity} • Completed</span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{new Date(grievance.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
  // --- Dynamic crossfade stack ---
  return (
    <>
      {(() => {
        const roleSelectionShow = (!role) || (transitioning && (outgoing === null || incoming === null));
        const roleSelectionFadingOut = transitioning && outgoing === null; // leaving selection -> portal

        const portalShow = (!!role) || (transitioning && (incoming !== null || outgoing !== null));
        const portalFadingOut = transitioning && incoming === null; // leaving portal -> selection

        return (
          <>
            <StackFade show={roleSelectionShow} fadingOut={roleSelectionFadingOut} overlay={true}>
              <RoleSelection onSelect={handleRoleSelect} />
            </StackFade>
            <StackFade show={portalShow} fadingOut={portalFadingOut} overlay={false}>
              {renderPortal}
            </StackFade>
          </>
        );
      })()}
    </>
  );
}