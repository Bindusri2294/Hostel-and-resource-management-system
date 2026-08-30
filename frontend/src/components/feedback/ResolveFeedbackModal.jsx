import React, { useState, useEffect } from 'react';
import { feedbackService } from '../../services/feedbackService';
import { X, ShieldCheck, Send, EyeOff, FileImage, Star, Clock, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ResolveFeedbackModal({ ticket, onClose, onSuccess }) {
  const [status, setStatus] = useState(ticket?.status || 'In Progress');
  const [adminResponse, setAdminResponse] = useState(ticket?.adminResponse || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status || 'In Progress');
      setAdminResponse(ticket.adminResponse || '');
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await feedbackService.updateFeedbackStatus(ticket._id, status, adminResponse);
      toast.success(`Ticket status updated to '${status}'!`);
      onSuccess(updated);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Manage Feedback Ticket</h3>
              <p className="text-xs text-slate-400">ID: {ticket._id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ticket Snapshot */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="font-semibold text-blue-400">{ticket.category}</span>
              <span>Submitted: {new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>

            <h4 className="font-bold text-white text-sm">{ticket.title}</h4>

            {ticket.isAnonymous ? (
              <div className="inline-flex items-center gap-1.5 text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 font-semibold text-[11px]">
                <EyeOff className="w-3.5 h-3.5" /> Anonymous Student Submission
              </div>
            ) : (
              <div className="text-slate-300">
                Student: <strong>{ticket.student?.name}</strong> ({ticket.student?.rollNo}) • Room {ticket.student?.roomNo}
              </div>
            )}

            <p className="text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs">
              {ticket.description}
            </p>

            {ticket.imageUrl && (
              <div className="pt-1">
                <a
                  href={ticket.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  <FileImage className="w-4 h-4" /> Open Maintenance Photo Attachment
                </a>
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ticket Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="Pending">⏳ Pending Review</option>
              <option value="In Progress">🔄 In Progress (Action Initiated)</option>
              <option value="Resolved">✅ Resolved (Issue Fixed)</option>
              <option value="Rejected">❌ Rejected / Closed</option>
            </select>
          </div>

          {/* Admin Response Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Official Warden Resolution Response Note
            </label>
            <textarea
              rows={3}
              placeholder="Enter remarks for the student regarding resolution progress..."
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Save Resolution
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
