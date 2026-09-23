import React, { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedbackService';
import { useTheme } from '../../context/ThemeContext';
import { X, ShieldCheck, Send, Star, CheckCircle2, Clock } from 'lucide-react';

export default function ResolveFeedbackModal({ feedback, onClose, onSuccess }) {

  const [status, setStatus] = useState(feedback?.status || 'Pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (feedback) {
      setStatus(feedback.status || 'Pending');
    }
  }, [feedback]);

  if (!feedback) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await feedbackService.updateFeedback(feedback._id, { status });
      const updated = res.data || { ...feedback, status };
      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update feedback status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-md bg-slate-900/40`}>
      <div className={`border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 bg-white border-slate-300 text-slate-900`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between bg-slate-50 border-slate-200`}>
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border bg-[#f3e5f5] text-[#673BB7] border-[#e1bee7]`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-base font-bold text-slate-900`}>Update Feedback Status</h3>
              <p className={`text-xs text-slate-500`}>ID: {feedback._id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-all text-slate-400 hover:text-slate-700 hover:bg-slate-200`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Feedback Snapshot */}
          <div className={`p-3.5 rounded-xl border space-y-2 text-xs bg-slate-50 border-slate-200`}>
            <div className={`flex items-center justify-between flex-wrap gap-2 text-slate-600`}>
              <span className={`font-bold text-[#673BB7]`}>Student ID: {feedback.studentId}</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#f3e5f5] text-[#512da8] border-[#e1bee7]`}>
                  {feedback.category || 'Overall Experience'}
                </span>
                <span>Room {feedback.RoomNo} ({feedback.Block})</span>
              </div>
            </div>

            <p className={`p-2.5 rounded-lg border text-xs leading-relaxed font-semibold bg-white border-slate-200 text-slate-800`}>
              {feedback.message}
            </p>

            {feedback.imageUrl && (() => {
              const serverBase = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
              const fullUrl = feedback.imageUrl.startsWith("http") ? feedback.imageUrl : `${serverBase}${feedback.imageUrl}`;
              return (
                <div className="pt-1">
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block border rounded-lg overflow-hidden shadow-sm hover:opacity-90 transition-all"
                  >
                    <img
                      src={fullUrl}
                      alt="Issue photo"
                      className="h-28 w-auto object-cover rounded-lg"
                    />
                  </a>
                </div>
              );
            })()}

            <div className="flex items-center gap-1 text-amber-500">
              <span className="font-semibold text-slate-500 mr-1">Rating:</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= feedback.rating
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-slate-300 fill-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Status Select */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 text-slate-800`}>
              Feedback Resolution Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none bg-slate-50 border-slate-300 text-slate-900 focus:border-[#673BB7] focus:bg-white shadow-sm`}
            >
              <option value="Pending">⏳ Pending Review</option>
              <option value="In Progress">⚡ In Progress</option>
              <option value="Completed">✅ Completed (Resolved)</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#673BB7] hover:bg-[#5e35b1] text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Save Status
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
