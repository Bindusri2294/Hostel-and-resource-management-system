import React, { useState } from 'react';
import { X, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';

export default function EscalateModal({ feedback, onClose, onSuccess }) {
  const [authority, setAuthority] = useState('DEAN');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!feedback) return null;

  const handleEscalate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await feedbackService.escalate(feedback._id, { authority, reason });
      onSuccess(res.data.feedback || { ...feedback, isEscalated: true, escalationAuthority: authority });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to escalate feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-xs bg-[#2F2925]/50">
      <div className="border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 bg-white border-[#E8D8C4] text-[#2F2925]">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between bg-rose-50/50 border-rose-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center border bg-white text-rose-500 border-rose-200 shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-900">Escalate Feedback</h3>
              <p className="text-xs text-rose-700/70">Ticket ID: {feedback._id?.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg transition-all text-rose-700/50 hover:text-rose-900 hover:bg-rose-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleEscalate} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200">
            <p className="text-xs font-bold text-slate-800 mb-1">Issue Overview:</p>
            <p className="text-[11px] text-slate-600 line-clamp-2">{feedback.message}</p>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#2F2925] uppercase tracking-wide mb-1.5">
              Escalate To
            </label>
            <select
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
              className="w-full bg-[#FEF7EE] border border-[#E8D8C4] rounded-xl p-3 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055] font-bold text-sm text-[#2F2925]"
            >
              <option value="DEAN">Dean</option>
              <option value="PRINCIPAL">Principal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#2F2925] uppercase tracking-wide mb-1.5">
              Reason for Escalation
            </label>
            <textarea
              required
              rows="3"
              placeholder="Why does this require higher authority intervention?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#FEF7EE] border border-[#E8D8C4] rounded-xl p-3 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055] font-semibold text-sm text-[#2F2925] resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-extrabold text-sm text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Escorting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Escalation Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
