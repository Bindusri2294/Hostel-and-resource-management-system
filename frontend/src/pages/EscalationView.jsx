import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { feedbackService } from '../services/feedbackService';

export default function EscalationView() {
  const { token } = useParams();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await feedbackService.getEscalated(token);
        setFeedback(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired escalation link.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [token]);

  const handleAction = async (actionType) => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await feedbackService.actionEscalated(token, { action: actionType, remarks });
      setFeedback(res.data.feedback);
      setSuccess('Action successfully recorded. Thank you.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit action.');
    } finally {
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#EB8055]" />
      </div>
    );
  }

  if (error && !feedback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-rose-100">
          <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-[#2F2925] p-6 text-white flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
            <ShieldCheck className="w-6 h-6 text-[#EB8055]" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Authority Feedback Escalation</h1>
            <p className="text-sm text-slate-400 mt-0.5">Secure direct-access portal</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {success}
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm font-bold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Ticket ID</p>
              <p className="font-bold text-slate-800">{feedback._id?.slice(-8).toUpperCase()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Current Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                feedback.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {feedback.status}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Category</p>
              <p className="font-bold text-slate-800">{feedback.category}</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Location</p>
              <p className="font-bold text-slate-800">Room {feedback.RoomNo} ({feedback.Block})</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#FDF0DC]/30 border border-[#E8D8C4]">
            <p className="text-xs uppercase tracking-wider font-extrabold text-[#B85228] mb-2">Student Issue</p>
            <p className="text-sm font-semibold text-[#2F2925] leading-relaxed">{feedback.message}</p>
          </div>

          <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100">
            <p className="text-xs uppercase tracking-wider font-extrabold text-rose-800 mb-2">Admin Escalation Reason</p>
            <p className="text-sm font-semibold text-rose-950 leading-relaxed">
              {feedback.escalationReason || 'No reason provided.'}
            </p>
          </div>

          {/* Action Area */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#EB8055]" />
              Provide Authority Action
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Official Remarks (Optional)</label>
              <textarea
                rows="3"
                disabled={feedback.status === 'Completed'}
                placeholder={feedback.status === 'Completed' ? "Ticket is already resolved." : "Enter your remarks or instructions..."}
                value={remarks || feedback.remarks || ''}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055] font-semibold text-sm text-slate-800 resize-none disabled:opacity-50"
              />
            </div>

            {feedback.status !== 'Completed' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAction('RemarkOnly')}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl font-extrabold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Save Remarks Only
                </button>
                <button
                  onClick={() => handleAction('Resolve')}
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl font-extrabold text-sm text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
