import React, { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedbackService';
import { useTheme } from '../../context/ThemeContext';
import { X, ShieldCheck, Send, Star, CheckCircle2, Clock } from 'lucide-react';

export default function ResolveFeedbackModal({ feedback, onClose, onSuccess }) {

  const [status, setStatus] = useState(feedback?.status || 'Pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);

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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs bg-[#2F2925]/50">
      <div className="border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 bg-white border-[#E8D8C4] text-[#2F2925]">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between bg-[#FDF0DC]/30 border-[#E8D8C4]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-[#FDF0DC] text-[#EB8055] border-[#E8D8C4]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2F2925]">Update Feedback Status</h3>
              <p className="text-xs text-[#8B7355]">ID: {feedback._id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-all text-[#8B7355] hover:text-[#2F2925] hover:bg-[#FDF0DC]"
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
          <div className="p-3.5 rounded-xl border space-y-2 text-xs bg-[#FDF0DC]/20 border-[#E8D8C4]">
            <div className="flex items-center justify-between flex-wrap gap-2 text-[#8B7355]">
              <span className="font-bold text-[#EB8055]">Student ID: {feedback.studentId}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#FDF0DC] text-[#B85228] border-[#E8D8C4]">
                  {feedback.category || 'Overall Experience'}
                </span>
                <span>Room {feedback.RoomNo} ({feedback.Block})</span>
              </div>
            </div>

            <p className="p-2.5 rounded-lg border text-xs leading-relaxed font-semibold bg-white border-[#E8D8C4] text-[#2F2925]">
              {feedback.message}
            </p>

            {feedback.imageUrl && (() => {
              const serverBase = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";
              const fullUrl = feedback.imageUrl.startsWith("http") ? feedback.imageUrl : `${serverBase}${feedback.imageUrl}`;
              return (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setLightboxImage(fullUrl)}
                    className="inline-block border rounded-lg overflow-hidden shadow-xs hover:opacity-90 transition-all cursor-pointer border-[#E8D8C4]"
                  >
                    <img
                      src={fullUrl}
                      alt="Issue photo"
                      className="h-28 w-auto object-cover rounded-lg block"
                    />
                  </button>
                </div>
              );
            })()}

            <div className="flex items-center gap-1 text-amber-500">
              <span className="font-semibold text-[#8B7355] mr-1">Rating:</span>
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
            <label className="block text-xs font-semibold mb-1.5 text-[#2F2925]">
              Feedback Resolution Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] shadow-xs cursor-pointer"
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
              className="flex-1 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer bg-[#FDF0DC] hover:bg-[#F5E8D4] text-[#2F2925] border-[#E8D8C4]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#EB8055] hover:bg-[#D96B3A] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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

      {/* IMAGE LIGHTBOX MODAL */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" 
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20">
            <button 
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 text-white rounded-full p-2 backdrop-blur-md transition-colors cursor-pointer z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
              title="Close Image"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={lightboxImage} 
              alt="Attached Photo" 
              className="max-w-full max-h-[90vh] object-contain block" 
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </>
  );
}
