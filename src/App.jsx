import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, Send, Trash2, RefreshCw, Sun, Moon, CheckCircle } from 'lucide-react';

// Import utilities and services
import { supabase, getDiscordUserId } from './services/supabase';
import { sanitizeInput } from './utils/sanitize';
import { validateGrievance } from './utils/validate';
import { checkRateLimit, setRateLimit, getRemainingCooldown } from './utils/rateLimit';
import {
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  SUBMISSION_COOLDOWN,
  NOTIFICATION_COOLDOWN,
  INACTIVITY_TIMEOUT,
  WARNING_TIME,
  FADE_DURATION,
  VALIDATION_ERROR_TIMEOUT,
  SUBMIT_OVERLAY_DURATION,
} from './constants/config';

// Import components
import PasswordScreen from './components/PasswordScreen';
import RoleSelection from './components/RoleSelection';
import PatchNotes from './components/PatchNotes';
import StackFade from './components/StackFade';


export default function GrievancePortal() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', severity: 'minor' });
  const [role, setRole] = useState(null);
  // Crossfade state
  const [transitioning, setTransitioning] = useState(false);
  const [outgoing, setOutgoing] = useState(null); // 'selection' | 'portal' | null
  const [incoming, setIncoming] = useState(null); // 'selection' | 'portal' | null
  const [pendingRole, setPendingRole] = useState(null); // role selected during transition
  // Submission overlay state
  const [showSubmitOverlay, setShowSubmitOverlay] = useState(false);
  const [submitOverlayFadingOut, setSubmitOverlayFadingOut] = useState(false);
  // Authentication state
  const [authenticated, setAuthenticated] = useState(false);
  const [validationError, setValidationError] = useState('');

  // James's Discord user ID from environment variable
  const DISCORD_USER_ID = getDiscordUserId();

  // Check authentication on mount
  useEffect(() => {
    const isAuth = sessionStorage.getItem('authenticated') === 'true';
    setAuthenticated(isAuth);
  }, []);

  // AFK Timer - Auto-logout after inactivity (constants imported from config)
  const [showAfkWarning, setShowAfkWarning] = useState(false);
  const [afkCountdown, setAfkCountdown] = useState(120); // 2 minutes in seconds
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('authenticated');
    setAuthenticated(false);
    setShowAfkWarning(false);
    setRole(null);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    // Clear existing timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Hide warning if it was showing
    setShowAfkWarning(false);
    setAfkCountdown(120);

    // Only set timers if authenticated
    if (authenticated) {
      // Set warning timer (shows 2 minutes before logout)
      warningTimerRef.current = setTimeout(() => {
        setShowAfkWarning(true);
        setAfkCountdown(120);

        // Start countdown
        countdownIntervalRef.current = setInterval(() => {
          setAfkCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Set logout timer
      inactivityTimerRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [authenticated, handleLogout]);

  // Track user activity
  useEffect(() => {
    if (!authenticated) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Start initial timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [authenticated, resetInactivityTimer]);

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

  // Real-time subscription for grievance changes
  useEffect(() => {
    if (!authenticated) return;

    const channel = supabase
      .channel('grievances-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'grievances' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setGrievances(prev => [payload.new, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setGrievances(prev => prev.map(g => 
              g.id === payload.new.id ? payload.new : g
            ));
          } else if (payload.eventType === 'DELETE') {
            setGrievances(prev => prev.filter(g => g.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authenticated]);

  const handleSubmit = async () => {
    // Validate input
    const errors = validateGrievance(formData.title, formData.description);
    if (errors.length > 0) {
      setValidationError(errors.join('. '));
      setTimeout(() => setValidationError(''), 5000);
      return;
    }

    // Check rate limit
    if (!checkRateLimit('lastSubmission', SUBMISSION_COOLDOWN)) {
      const remaining = getRemainingCooldown('lastSubmission', SUBMISSION_COOLDOWN);
      setValidationError(`Please wait ${remaining} seconds before submitting another grievance.`);
      setTimeout(() => setValidationError(''), 5000);
      return;
    }

    // Sanitize input
    const sanitizedTitle = sanitizeInput(formData.title.trim());
    const sanitizedDescription = sanitizeInput(formData.description.trim());

    const newGrievance = {
      title: sanitizedTitle,
      description: sanitizedDescription,
      severity: formData.severity,
      status: 'Under Review'
    };

    const { error } = await supabase
      .from('grievances')
      .insert([newGrievance]);

    if (error) {
      console.error('Error submitting grievance:', error);
      setValidationError('Failed to submit grievance. Please try again.');
      setTimeout(() => setValidationError(''), 5000);
    } else {
      setRateLimit('lastSubmission');
      setFormData({ title: '', description: '', severity: 'minor' });
      setValidationError('');
      loadGrievances(); // Reload to show new grievance (fallback if real-time not enabled)
      // Show transient confirmation overlay
      setShowSubmitOverlay(true);
      setSubmitOverlayFadingOut(false);
      setTimeout(() => {
        setSubmitOverlayFadingOut(true);
        setTimeout(() => setShowSubmitOverlay(false), FADE_DURATION);
      }, SUBMIT_OVERLAY_DURATION);
      // Always notify James after a successful submission
      try {
        const { error: notifyError } = await supabase.functions.invoke("notify-discord", {
          body: {
            userId: DISCORD_USER_ID,
            type: "notify",
            title: sanitizedTitle,
            description: sanitizedDescription
          }
        });
        if (notifyError) throw notifyError;
        // overlay provides confirmation
      } catch (e) {
        console.error('Notification failed:', e);
        // overlay shows success; errors are silent here
      }
    }
  };

  const deleteGrievance = async (id) => {
    // Show confirmation dialog before deleting
    const confirmed = window.confirm('Are you sure you want to delete this grievance? This action cannot be undone.');

    if (!confirmed) {
      return; // User cancelled
    }

    const { error } = await supabase
      .from('grievances')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting grievance:', error);
      setValidationError('Failed to delete grievance. Please try again.');
      setTimeout(() => setValidationError(''), 5000);
    } else {
      loadGrievances(); // Reload after deletion (fallback if real-time not enabled)
    }
  };

  // Mark grievance complete
  const markCompleted = async (id, completed) => {
    // This assumes a 'completed' bool column exists in Supabase,
    // otherwise fallback to status, or show UI only
    const { error } = await supabase
      .from('grievances')
      .update({ completed })
      .eq('id', id);
    if (error) {
      console.error('Error updating grievance:', error);
      setValidationError("Failed to update grievance. Please try again.");
      setTimeout(() => setValidationError(''), 5000);
      return;
    }
    loadGrievances(); // Reload after update (fallback if real-time not enabled)
  };

  // --- NEW: Split active/completed grievances ---
  const activeGrievances = grievances.filter(g => !g.completed && g.status !== 'Completed');
  const completedGrievances = grievances.filter(g => g.completed || g.status === 'Completed');

  // Role selection (non-persistent, using FADE_DURATION from config)
  const handleRoleSelect = newRole => {
    if (transitioning) return;
    setPendingRole(newRole);
    setOutgoing('selection');
    setIncoming('portal');
    setTransitioning(true);
    setTimeout(() => {
      setRole(newRole);
      setTransitioning(false);
      setOutgoing(null);
      setIncoming(null);
      setPendingRole(null);
    }, FADE_DURATION);
  };
  const handleRoleSwitch = () => {
    if (transitioning) return;
    setPendingRole(null);
    setOutgoing('portal');
    setIncoming('selection');
    setTransitioning(true);
    setTimeout(() => {
      setRole(null);
      setTransitioning(false);
      setOutgoing(null);
      setIncoming(null);
    }, FADE_DURATION);
  };

  // Discord notification handlers
  const [sendingNotify, setSendingNotify] = useState(false);
  const [sendingAttention, setSendingAttention] = useState(false);

  const notifyBoyfriend = async () => {
    if (sendingNotify) return;

    // Validate form data before sending notification
    const errors = validateGrievance(formData.title, formData.description);
    if (errors.length > 0) {
      setValidationError('Please fill out the title and description before sending a notification.');
      setTimeout(() => setValidationError(''), 5000);
      return;
    }

    // Check rate limit
    if (!checkRateLimit('lastNotification', NOTIFICATION_COOLDOWN)) {
      const remaining = getRemainingCooldown('lastNotification', NOTIFICATION_COOLDOWN);
      setValidationError(`Please wait ${remaining} seconds before sending another notification.`);
      setTimeout(() => setValidationError(''), 5000);
      return;
    }

    setSendingNotify(true);
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
      setRateLimit('lastNotification');
      // success
    } catch (e) {
      console.error(e);
      setValidationError('Failed to send notification. Please try again.');
      setTimeout(() => setValidationError(''), 5000);
    }
    setSendingNotify(false);
  };

  const attentionPing = async () => {
    if (sendingAttention) return;

    // Validate form data before sending notification
    const errors = validateGrievance(formData.title, formData.description);
    if (errors.length > 0) {
      setValidationError('Please fill out the title and description before sending an attention ping.');
      setTimeout(() => setValidationError(''), 5000);
      return;
    }

    // Check rate limit
    if (!checkRateLimit('lastAttention', NOTIFICATION_COOLDOWN)) {
      const remaining = getRemainingCooldown('lastAttention', NOTIFICATION_COOLDOWN);
      setValidationError(`Please wait ${remaining} seconds before sending another attention ping.`);
      setTimeout(() => setValidationError(''), 5000);
      return;
    }

    setSendingAttention(true);
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
      setRateLimit('lastAttention');
      // success
    } catch (e) {
      console.error(e);
      setValidationError('Failed to send attention ping. Please try again.');
      setTimeout(() => setValidationError(''), 5000);
    }
    setSendingAttention(false);
  };

  // Which screens to render for crossfade
  const activeRole = (transitioning && incoming === 'portal') ? (pendingRole ?? role) : role;
  // Apply a body class for James theme (used for scrollbar styling)
  useEffect(() => {
    if (activeRole === 'boyfriend') {
      document.body.classList.add('james-theme');
    } else {
      document.body.classList.remove('james-theme');
    }
    return () => {
      document.body.classList.remove('james-theme');
    };
  }, [activeRole]);
  const renderPortal = (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${
      activeRole === 'boyfriend'
        ? (darkMode ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100')
        : (darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900' : '')
    }`}>  
      <div className="max-w-4xl mx-auto transition-opacity duration-500 ease-out opacity-100">
        <div className="flex justify-between items-start mb-8">
          <button
            onClick={handleRoleSwitch}
            className={`transition-all px-4 py-2 rounded-2xl text-sm mt-2 border font-bold shadow hover:scale-105 active:scale-100 z-30 focus:outline-none ${
              activeRole === 'boyfriend'
                ? (darkMode
                    ? 'bg-blue-900/30 text-blue-200 border-blue-700 hover:bg-blue-800/60'
                    : 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200')
                : (darkMode
                    ? 'bg-pink-900/30 text-pink-200 border-pink-700 hover:bg-pink-800/60'
                    : 'bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200')
            }`}
            style={{letterSpacing:2}}
            title="Switch role? You can show or hide completed grievances.">
              Switch Role
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full transition-all duration-300 ${
              activeRole === 'boyfriend'
                ? (darkMode ? 'bg-blue-300 hover:bg-blue-200 text-blue-800' : 'bg-gray-800 hover:bg-gray-700 text-white')
                : (darkMode ? 'bg-pink-300 hover:bg-pink-200 text-pink-800' : 'bg-gray-800 hover:bg-gray-700 text-white')
            } shadow-lg hover:scale-110`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        <div className="text-center mb-8">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 hover:scale-110 transition-transform duration-300 animate-float ${
            activeRole === 'boyfriend'
              ? (darkMode ? 'text-blue-300' : 'text-blue-600')
              : (darkMode ? 'text-purple-400' : 'text-purple-600')
          }`} style={{
            filter: `drop-shadow(0 0 8px ${darkMode ? 'rgba(147, 51, 234, 0.4)' : 'rgba(147, 51, 234, 0.3)'})`
          }} />
          <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-sm">
            <span className={`bg-clip-text text-transparent ${
              activeRole === 'boyfriend'
                ? (darkMode ? 'bg-gradient-to-r from-blue-300 via-cyan-300 to-indigo-300'
                             : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600')
                : (darkMode ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400'
                             : 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600')
            }`}>{activeRole === 'boyfriend' ? "James's Inbox" : "Ally's Grievance Portal"}</span>
          </h1>
          {activeRole !== 'boyfriend' && (
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Please tell me how you feel. 💕</p>
          )}
        </div>

        {activeRole !== 'boyfriend' && (
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
            {validationError && (
              <div className={`p-3 rounded-xl border-2 ${
                darkMode ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-300 text-red-700'
              }`}>
                <p className="text-sm font-semibold">{validationError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  The Incident... 🚨
                  <span className={`ml-2 text-xs ${formData.title.length > MAX_TITLE_LENGTH ? 'text-red-500' : ''}`}>
                    ({formData.title.length}/{MAX_TITLE_LENGTH})
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  maxLength={MAX_TITLE_LENGTH}
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
                  <span className={`ml-2 text-xs ${formData.description.length > MAX_DESCRIPTION_LENGTH ? 'text-red-500' : ''}`}>
                    ({formData.description.length}/{MAX_DESCRIPTION_LENGTH})
                  </span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  maxLength={MAX_DESCRIPTION_LENGTH}
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
                disabled={sendingNotify}
                className={`w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${sendingNotify ? 'opacity-60 cursor-not-allowed' : 'hover:from-purple-600 hover:to-pink-700'}`}
              >
                {sendingNotify ? 'Notifying…' : 'Notify Boyfriend'}
              </button>
              <button
                onClick={attentionPing}
                disabled={sendingAttention}
                className={`w-full bg-gradient-to-r from-red-500 to-rose-600 text-white py-3 rounded-2xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${sendingAttention ? 'opacity-60 cursor-not-allowed' : 'hover:from-red-600 hover:to-rose-700 hover:animate-pulse focus:animate-pulse'}`}
              >
                {sendingAttention ? 'Sending…' : 'Attention NOW'}
              </button>
            </div>
            {/* Inline status removed in favor of overlay */}
          </div>
        )}

        {/* --- FILED (ACTIVE) GRIEVANCES --- */}
        <div className={`backdrop-blur-sm rounded-3xl shadow-xl p-6 mt-8 mb-8 border hover:shadow-2xl transition-all duration-300 ${
          activeRole === 'boyfriend'
            ? (darkMode ? 'bg-slate-900/80 border-blue-900/40' : 'bg-blue-50/80 border-blue-200/50')
            : (darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-white/20')
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              <span className={`bg-clip-text text-transparent ${
                activeRole === 'boyfriend'
                  ? (darkMode ? 'bg-gradient-to-r from-blue-300 to-cyan-300' : 'bg-gradient-to-r from-blue-600 to-cyan-600')
                  : (darkMode ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gradient-to-r from-pink-600 to-purple-600')
              }`}>Filed Grievances ({activeGrievances.length})</span>
            </h2>
            <button
              onClick={loadGrievances}
              className={`flex items-center gap-2 hover:scale-110 transition-all duration-300 px-3 py-2 rounded-xl ${
                activeRole === 'boyfriend'
                  ? (darkMode
                      ? 'text-blue-300 hover:text-blue-200 bg-slate-700 hover:bg-slate-600'
                      : 'text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100')
                  : (darkMode
                      ? 'text-purple-400 hover:text-purple-300 bg-gray-700 hover:bg-gray-600'
                      : 'text-purple-600 hover:text-purple-700 bg-pink-50 hover:bg-pink-100')
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
          ) : (
            <div className="space-y-6">
              {activeGrievances.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No active grievances found. 🎉</p>
                </div>
              ) : (
                activeGrievances.map(grievance => (
                  <div key={grievance.id} className={`backdrop-blur-sm rounded-2xl shadow p-5 border transition-all duration-200 ${
                    activeRole === 'boyfriend'
                      ? (darkMode ? 'bg-slate-800/80 border-blue-800/40' : 'bg-blue-50/80 border-blue-200/50')
                      : (darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-white/20')
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {sanitizeInput(grievance.title)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => markCompleted(grievance.id, true)}
                          className={`${darkMode ? 'bg-green-900/40 text-green-300 hover:bg-green-700/60' : 'bg-green-100 text-green-800 hover:bg-green-300'} px-3 py-1 rounded-lg transition-all duration-200 font-semibold`}
                          title="Mark as Completed"
                        >
                          ✓ Complete
                        </button>
                        <button
                          onClick={() => deleteGrievance(grievance.id)}
                          className={`p-2 rounded-full transition-colors duration-200 ${
                            darkMode ? 'text-red-400 hover:text-red-300 hover:bg-red-900/30' : 'text-red-600 hover:text-red-500 hover:bg-red-50'
                          }`}
                          title="Delete Grievance"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{sanitizeInput(grievance.description)}</p>
                    <div className="flex justify-between items-center mt-4 text-xs">
                      <span className={`font-semibold uppercase px-3 py-1 rounded-full ${darkMode ? 'bg-gradient-to-r from-pink-900/50 to-purple-900/50 text-purple-300' : 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700'}`}>
                        {grievance.severity} • {grievance.status}
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{new Date(grievance.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* --- COMPLETED GRIEVANCES --- */}
        <div className={`backdrop-blur-sm rounded-3xl shadow-xl p-6 mt-8 mb-8 border hover:shadow-2xl transition-all duration-300 ${
          darkMode ? 'bg-gray-900/80 border-green-900/40' : 'bg-green-50/70 border-green-300/30'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              <span className={`bg-clip-text text-transparent ${
                activeRole === 'boyfriend'
                  ? (darkMode ? 'bg-gradient-to-r from-blue-300 to-cyan-300' : 'bg-gradient-to-r from-blue-600 to-cyan-600')
                  : (darkMode ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gradient-to-r from-pink-600 to-purple-600')
              }`}>Completed Grievances ({completedGrievances.length})</span>
            </h2>
            <button
              onClick={loadGrievances}
              className={`flex items-center gap-2 hover:scale-110 transition-all duration-300 px-3 py-2 rounded-xl ${
                activeRole === 'boyfriend'
                  ? (darkMode
                      ? 'text-blue-300 hover:text-blue-200 bg-slate-700 hover:bg-slate-600'
                      : 'text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100')
                  : (darkMode
                      ? 'text-purple-400 hover:text-purple-300 bg-gray-700 hover:bg-gray-600'
                      : 'text-purple-600 hover:text-purple-700 bg-pink-50 hover:bg-pink-100')
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
          ) : (
            <div className="space-y-6">
              {completedGrievances.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No completed grievances found. 🎉</p>
                </div>
              ) : (
                completedGrievances.map(grievance => (
                  <div key={grievance.id} className={`backdrop-blur-sm rounded-2xl shadow p-5 border transition-all duration-200 ${
                    darkMode ? 'bg-gray-800/80 border-gray-700/50' : 'bg-white/80 border-white/20'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {sanitizeInput(grievance.title)}
                      </h3>
                      <button
                        onClick={() => markCompleted(grievance.id, false)}
                        className={`${darkMode ? 'bg-yellow-900/40 text-yellow-300 hover:bg-yellow-700/60' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-300'} px-3 py-1 rounded-lg transition-all duration-200 font-semibold`}
                      >
                        ↩ Back to Open
                      </button>
                    </div>
                    <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{sanitizeInput(grievance.description)}</p>
                    <div className="flex justify-between items-center mt-4 text-xs">
                      <span className={`font-semibold uppercase px-3 py-1 rounded-full ${
                        darkMode ? 'bg-gradient-to-r from-green-900/30 to-pink-900/10 text-green-200' : 'bg-gradient-to-r from-green-200 to-pink-100 text-green-700'
                      }`}>
                        {grievance.severity} • Completed
                      </span>
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{new Date(grievance.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Crossfade render: blend selection and portal
  const showSelection = (!role) || (transitioning && (incoming === 'selection' || outgoing === 'selection'));
  const selectionFadingOut = transitioning && outgoing === 'selection';
  const showPortal = (role) || (transitioning && (incoming === 'portal' || outgoing === 'portal'));
  const portalFadingOut = transitioning && outgoing === 'portal';

  // If not authenticated, show password screen
  if (!authenticated) {
    return <PasswordScreen onAuthenticated={() => setAuthenticated(true)} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />;
  }

  return (
    <>
      <StackFade show={showSelection} fadingOut={selectionFadingOut} overlay>
        <div className={`${selectionFadingOut ? 'fade-out-soft' : 'fade-in-soft'} transform-gpu`} style={{backdropFilter: 'none'}}>
          <RoleSelection onSelect={handleRoleSelect} notes={<PatchNotes darkMode={darkMode} />} darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} />
        </div>
      </StackFade>
      <StackFade show={showPortal} fadingOut={portalFadingOut} overlay={false}>
        <div className={`${portalFadingOut ? 'fade-out-soft' : 'fade-in-soft'} transform-gpu`}>
          {renderPortal}
        </div>
      </StackFade>
      {/* Submission confirmation overlay */}
      <StackFade show={showSubmitOverlay} fadingOut={submitOverlayFadingOut} overlay>
        <div className={`${submitOverlayFadingOut ? 'fade-out-soft' : 'fade-in-soft'} w-full h-full flex items-center justify-center ${darkMode ? 'bg-black/50' : 'bg-black/40'} backdrop-blur-md`}> 
          <div className={`rounded-3xl border shadow-2xl px-6 py-5 ${darkMode ? 'bg-neutral-900/80 border-neutral-700 text-neutral-100' : 'bg-white/90 border-gray-200 text-gray-900'}`}>
            <div className="flex items-center gap-3">
              <CheckCircle className={`${darkMode ? 'text-green-300' : 'text-green-600'}`} size={24} />
              <div className="text-lg font-semibold">Grievance submitted</div>
            </div>
            <div className={`${darkMode ? 'text-neutral-400' : 'text-gray-500'} text-sm mt-1`}>James has been notified.</div>
          </div>
        </div>
      </StackFade>
      {/* AFK Warning overlay */}
      {showAfkWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className={`rounded-3xl border-2 shadow-2xl p-8 m-4 max-w-md ${darkMode ? 'bg-neutral-900/95 border-yellow-700 text-neutral-100' : 'bg-white/95 border-yellow-400 text-gray-900'}`}>
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${darkMode ? 'bg-yellow-900/40' : 'bg-yellow-100'}`}>
                <AlertCircle className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Still there?</h3>
              <p className={`mb-4 ${darkMode ? 'text-neutral-300' : 'text-gray-600'}`}>
                You've been inactive for a while.
              </p>
              <div className={`text-5xl font-bold mb-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                {Math.floor(afkCountdown / 60)}:{String(afkCountdown % 60).padStart(2, '0')}
              </div>
              <p className={`mb-6 text-sm ${darkMode ? 'text-neutral-400' : 'text-gray-500'}`}>
                You'll be logged out automatically for security.
              </p>
              <button
                onClick={resetInactivityTimer}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                I'm Still Here!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}