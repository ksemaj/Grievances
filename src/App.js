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
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'major': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-purple-600" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Ally's Grievance Portal</h1>
          <p className="text-gray-600">Please tell me how you feel.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Submit New Grievance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                The Incident...
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Let me open the door for myself."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your point of view
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe the grievance in detail..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity Level
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="minor">Minor Annoyance</option>
                <option value="major">Major Issue</option>
                <option value="critical">CRITICAL OFFENSE</option>
              </select>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Submit Grievance
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Filed Grievances ({grievances.length})
            </h2>
            <button
              onClick={loadGrievances}
              className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
            >
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
          
          {loading ? (
            <p className="text-gray-500 text-center py-8">Loading grievances...</p>
          ) : grievances.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No grievances filed yet. Things are ok. ❤️</p>
          ) : (
            <div className="space-y-4">
              {grievances.map((grievance) => (
                <div
                  key={grievance.id}
                  className={`border-2 rounded-lg p-4 ${getSeverityColor(grievance.severity)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{grievance.title}</h3>
                    <button
                      onClick={() => deleteGrievance(grievance.id)}
                      className="text-gray-600 hover:text-red-600 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-sm mb-3">{grievance.description}</p>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold uppercase">
                      {grievance.severity} • {grievance.status}
                    </span>
                    <span>{new Date(grievance.created_at).toLocaleDateString()}</span>
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