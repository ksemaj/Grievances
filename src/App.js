import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AlertCircle, Send, Trash2, RefreshCw } from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function GrievancePortal() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'minor'
  });

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

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-gradient-to-br from-red-100 to-pink-100 text-red-800 border-red-200 shadow-red-200';
      case 'major': return 'bg-gradient-to-br from-orange-100 to-pink-100 text-orange-800 border-orange-200 shadow-orange-200';
      case 'minor': return 'bg-gradient-to-br from-yellow-100 to-pink-100 text-yellow-800 border-yellow-200 shadow-yellow-200';
      default: return 'bg-gradient-to-br from-gray-100 to-pink-50 text-gray-800 border-gray-200 shadow-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <AlertCircle className="relative w-16 h-16 mx-auto mb-4 text-purple-600 drop-shadow-lg hover:scale-110 transition-transform duration-300 animate-float" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 drop-shadow-sm">
            Ally's Grievance Portal ✨
          </h1>
          <p className="text-gray-600 text-lg">Please tell me how you feel. 💕</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border border-white/20 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Submit New Grievance 💌
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                The Incident... 🚨
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 hover:border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50"
                placeholder="e.g., Let me open the door for myself."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your point of view 💭
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 hover:border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50 resize-none"
                placeholder="Describe the grievance in detail..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Level ⚡
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: e.target.value})}
                className="w-full px-4 py-3 border-2 border-pink-200 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 hover:border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50"
              >
                <option value="minor">Minor Annoyance 😤</option>
                <option value="major">Major Issue 😠</option>
                <option value="critical">CRITICAL OFFENSE 😡</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform"
            >
              <Send size={20} />
              Submit Grievance ✨
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Filed Grievances ({grievances.length}) 📝
            </h2>
            <button
              onClick={loadGrievances}
              className="text-purple-600 hover:text-purple-700 flex items-center gap-2 hover:scale-110 transition-all duration-300 bg-pink-50 hover:bg-pink-100 px-3 py-2 rounded-xl"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mb-4"></div>
              <p className="text-gray-500">Loading grievances... ✨</p>
            </div>
          ) : grievances.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🌸</div>
              <p className="text-gray-500 text-lg">No grievances filed yet. Things are ok. ❤️</p>
            </div>
          ) : (
            <div className="space-y-4">
              {grievances.map((grievance) => (
                <div
                  key={grievance.id}
                  className={`border-2 rounded-2xl p-5 ${getSeverityColor(grievance.severity)} hover:shadow-lg transition-all duration-300 hover:scale-105 transform backdrop-blur-sm bg-white/70`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-800">{grievance.title}</h3>
                    <button
                      onClick={() => deleteGrievance(grievance.id)}
                      className="text-gray-600 hover:text-red-600 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-sm mb-4 text-gray-700 leading-relaxed">{grievance.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold uppercase px-3 py-1 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700">
                      {grievance.severity} • {grievance.status}
                    </span>
                    <span className="text-gray-500">{new Date(grievance.created_at).toLocaleDateString()}</span>
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