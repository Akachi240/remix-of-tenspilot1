'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { savePainLog } from '@/lib/pain';
import { ArrowLeft } from 'lucide-react';

interface PainTrackerProps {
  onSuccess?: () => void;
}

export function PainTracker({ onSuccess }: PainTrackerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [painLevel, setPainLevel] = useState(5);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const painLabels: { [key: number]: string } = {
    0: 'No pain',
    1: 'Minimal',
    2: 'Mild',
    3: 'Mild-Moderate',
    4: 'Moderate',
    5: 'Moderate',
    6: 'Moderate-Severe',
    7: 'Severe',
    8: 'Severe',
    9: 'Very Severe',
    10: 'Worst Possible',
  };

  const getPainColor = (level: number) => {
    if (level <= 3) return '#22C55E';
    if (level <= 6) return '#EAB308';
    if (level <= 8) return '#F97316';
    return '#EF4444';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to record pain levels');
      return;
    }

    if (!location.trim()) {
      setError('Please specify where the pain is located');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await savePainLog(user.uid, painLevel, location.trim(), notes.trim());
      setSubmitted(true);
      setPainLevel(5);
      setLocation('');
      setNotes('');

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      console.error('Error saving pain log:', err);
      setError('Failed to record pain level. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-[#0891B2] hover:text-[#134E4A] transition-colors font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-2xl mx-auto p-4 md:p-6 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#134E4A] mb-2">
            Pain Level Tracker
          </h1>
          <p className="text-lg text-[#0891B2]">
            Help us understand your pain to better support your recovery
          </p>
        </div>

        {submitted && (
          <div className="mb-6 p-4 bg-[#F0FDFA] border-l-4 border-[#22C55E] rounded" role="alert">
            <p className="text-[#134E4A] font-semibold">
              ✓ Pain level recorded successfully and saved to Firebase!
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded" role="alert">
            <p className="text-red-700 font-semibold">✗ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg p-6 md:p-8 border border-[#22D3EE] shadow-sm">
            <div className="mb-6">
              <label htmlFor="pain-slider" className="block text-xl font-semibold text-[#134E4A] mb-4">
                How much pain are you in right now?
              </label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#0891B2] font-medium">0</span>
                <input
                  id="pain-slider"
                  type="range"
                  min="0"
                  max="10"
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="flex-1 h-3 bg-[#E0F2FE] rounded-lg appearance-none cursor-pointer accent-[#0891B2]"
                  disabled={loading}
                />
                <span className="text-sm text-[#0891B2] font-medium">10</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#F0FDFA] to-[#E0F2FE] rounded-lg">
              <div>
                <p className="text-sm text-[#0891B2] font-medium">Current Pain Level</p>
                <p className="text-[#134E4A] mt-1">{painLabels[painLevel]}</p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold transition-all duration-300" style={{ color: getPainColor(painLevel) }}>
                  {painLevel}
                </div>
                <p className="text-xs text-gray-500 mt-2">out of 10</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 md:p-8 border border-[#22D3EE] shadow-sm">
            <label htmlFor="location" className="block text-lg font-semibold text-[#134E4A] mb-3">
              Where is the pain? *
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Lower back, Left knee, Neck"
              className="w-full px-4 py-3 text-base border-2 border-[#E0F2FE] rounded-lg focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#22D3EE] focus:ring-opacity-50 transition-all"
              disabled={loading}
              required
            />
          </div>

          <div className="bg-white rounded-lg p-6 md:p-8 border border-[#22D3EE] shadow-sm">
            <label htmlFor="notes" className="block text-lg font-semibold text-[#134E4A] mb-3">
              Additional notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What makes it worse? What makes it better?"
              rows={4}
              className="w-full px-4 py-3 text-base border-2 border-[#E0F2FE] rounded-lg focus:outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#22D3EE] focus:ring-opacity-50 transition-all resize-none"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !user}
            className="w-full py-4 px-6 text-lg font-semibold text-white bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-[#22C55E] focus:ring-opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Recording to Firebase...
              </span>
            ) : !user ? (
              'Please log in to record pain'
            ) : (
              'Record Pain Level'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
