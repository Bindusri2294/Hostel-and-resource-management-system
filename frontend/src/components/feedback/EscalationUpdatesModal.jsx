import React from 'react';
import { X, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export default function EscalationUpdatesModal({ feedbacks, onClose }) {
  const escalatedFeedbacks = feedbacks
    .filter((f) => f.isEscalated)
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto backdrop-blur-xs bg-[#2F2925]/50">
      <div className="border rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 bg-white border-[#E8D8C4] text-[#2F2925]">
        {/* Header */}
        <div className="p-5 sm:px-6 border-b flex items-center justify-between bg-[#FDF0DC]/30 border-[#E8D8C4] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-[#FDF0DC] text-[#EB8055] border-[#E8D8C4]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2F2925]">Escalation Updates</h3>
              <p className="text-xs font-semibold text-[#8B7355]">Track authority responses and status</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-all text-[#8B7355] hover:text-[#2F2925] hover:bg-[#FDF0DC] cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* List Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-white">
          {escalatedFeedbacks.length === 0 ? (
            <div className="text-center p-8 border rounded-2xl border-dashed border-[#E8D8C4] bg-[#FDF0DC]/20">
              <ShieldCheck className="w-8 h-8 mx-auto text-[#EB8055]/50 mb-2" />
              <p className="text-sm font-bold text-[#2F2925]">No escalated tickets</p>
              <p className="text-xs font-semibold text-[#8B7355] mt-1">You haven't escalated any feedback tickets yet.</p>
            </div>
          ) : (
            escalatedFeedbacks.map((item) => (
              <div key={item._id} className="bg-white border border-[#E8D8C4] rounded-2xl p-4 shadow-xs hover:border-[#EB8055]/50 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border bg-[#FDF0DC] text-[#B85228] border-[#E8D8C4]">
                        ID: {item._id?.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border bg-[#FDF0DC] text-[#EB8055] border-[#E8D8C4] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> {item.escalationAuthority}
                      </span>
                      {item.status === 'Completed' ? (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Resolved
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-[#2F2925] mt-2">
                      Room {item.RoomNo} ({item.Block}) - {item.category}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-[#8B7355] shrink-0 text-right">
                    {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl">
                    <p className="text-[10px] uppercase font-extrabold text-[#B85228] mb-1">Student Issue:</p>
                    <p className="text-xs font-semibold text-[#2F2925] line-clamp-2">{item.message}</p>
                  </div>
                  
                  <div className="p-3 bg-[#FDF0DC]/20 border border-[#E8D8C4] rounded-xl">
                    <p className="text-[10px] uppercase font-extrabold text-[#B85228] mb-1">Authority Remarks:</p>
                    {item.remarks ? (
                      <p className="text-xs font-semibold text-[#2F2925] italic">"{item.remarks}"</p>
                    ) : (
                      <p className="text-xs font-semibold text-[#8B7355] italic">Awaiting response from {item.escalationAuthority}...</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
