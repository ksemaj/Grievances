import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AlertCircle, Send, Trash2, RefreshCw, Sun, Moon } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function GrievancePortal() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'minor'
  });

  // Update body background when dark mode changes
  useEffect(() => {
    if (darkMode) {
      document.body.style.background = 'linear-gradient(135deg, #1f2937 0%, #581c87 50%, #312e81 100%)';
    } else {
      document.body.style.background = 'linear-gradient(135deg, #fdf2f8 0%, #f3e8ff 50%, #e0e7ff 100%)';
    }
  }, [darkMode]);

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1"></div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-all duration-300 ${
              darkMode 
                ? 'bg-pink-300 hover:bg-pink-200 text-pink-800' 
                : 'bg-gray-800 hover:bg-gray-700 text-white'
            } shadow-lg hover:scale-110`}
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
            ? 'bg-gray-800 border-gray-700/50' 
            : 'bg-white border-white/20'
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
        </div>

        <div className={`backdrop-blur-sm rounded-3xl shadow-xl p-6 border hover:shadow-2xl transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700/50' 
            : 'bg-white border-white/20'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">
              <span className={`bg-clip-text text-transparent ${
                darkMode 
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400' 
                  : 'bg-gradient-to-r from-pink-600 to-purple-600'
              }`}>Filed Grievances ({grievances.length})</span>
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
          ) : grievances.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🌸</div>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No grievances filed yet. Things are ok.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grievances.map((grievance) => (
                <div
                  key={grievance.id}
                  className={`border-2 rounded-2xl p-5 ${getSeverityColor(grievance.severity)} hover:shadow-lg transition-all duration-300 hover:scale-105 transform backdrop-blur-sm ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`font-bold text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{grievance.title}</h3>
                    <button
                      onClick={() => deleteGrievance(grievance.id)}
                      className={`transition-all duration-300 hover:scale-110 p-1 rounded-lg ${
                        darkMode 
                          ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30' 
                          : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className={`text-sm mb-4 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{grievance.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-semibold uppercase px-3 py-1 rounded-full ${
                      darkMode 
                        ? 'bg-gradient-to-r from-pink-900/50 to-purple-900/50 text-purple-300' 
                        : 'bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700'
                    }`}>
                      {grievance.severity} • {grievance.status}
                    </span>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>{new Date(grievance.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}