import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { feedbackService } from '../../services/feedbackService';
import ResolveFeedbackModal from './ResolveFeedbackModal';
import EscalateModal from './EscalateModal';
import EscalationUpdatesModal from './EscalationUpdatesModal';
import AdminSearchBar from '../../components/AdminSearchBar';
import {
  ShieldCheck,
  LogOut,
  Search,
  Star,
  Clock,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Trash2,
  X,
} from 'lucide-react';export default function AdminFeedbackDashboard() {
  const { user, logout } = useAuth();

  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [escalationFilter, setEscalationFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modal State
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [escalateFeedback, setEscalateFeedback] = useState(null);
  const [showEscalationUpdates, setShowEscalationUpdates] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await feedbackService.getFeedbacks();
      const data = Array.isArray(res.data) ? res.data : [];
      setFeedbacks(data);
    } catch (err) {
      // Handle gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback record?')) return;
    try {
      await feedbackService.deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert('Failed to delete feedback record.');
    }
  };

  const handleUpdateSuccess = (updatedItem) => {
    setFeedbacks((prev) =>
      prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
    );
    fetchData();
  };

  // Compute analytics from feedbacks
  const totalCount = feedbacks.length;
  const pendingCount = feedbacks.filter((f) => f.status === 'Pending').length;
  const inProgressCount = feedbacks.filter((f) => f.status === 'In Progress').length;
  const completedCount = feedbacks.filter((f) => f.status === 'Completed').length;
  const escalatedCount = feedbacks.filter((f) => f.isEscalated).length;
  const avgRating =
    totalCount > 0
      ? (feedbacks.reduce((sum, f) => sum + Number(f.rating || 0), 0) / totalCount).toFixed(1)
      : '0.0';

  // Apply filters
  const filteredFeedbacks = feedbacks.filter((item) => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && (item.category || 'Overall Experience') !== categoryFilter) return false;
    if (ratingFilter !== 'All' && String(item.rating) !== String(ratingFilter)) return false;
    if (escalationFilter === 'Escalated' && !item.isEscalated) return false;
    if (escalationFilter === 'Not Escalated' && item.isEscalated) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchMsg = item.message?.toLowerCase().includes(q);
      const searchableFields = [
        item._id ? item._id.slice(-8) : "",
        item.RoomNo,
        item.Block,
        item.category,
        item.subject,
        item.message,
      ];
      return searchableFields.some((field) => String(field || '').toLowerCase().includes(q));
    }
    return true;
  });

  const getStatusBadge = (st) => {
    if (st === 'Completed') {
      return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-100 text-emerald-900 border-emerald-300`}>
          <CheckCircle2 className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (st === 'In Progress') {
      return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-100 text-blue-900 border-blue-300`}>
          <RefreshCw className="w-3 h-3" /> In Progress
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-100 text-amber-900 border-amber-300`}>
        <Clock className="w-3 h-3" /> Pending Review
      </span>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 bg-slate-50 text-slate-900`}>


      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* KPI STATS HEADER CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="border p-4 rounded-2xl bg-white border-[#E8D8C4] shadow-xs">
            <span className="text-xs font-semibold block text-[#8B7355]">Total Feedback</span>
            <span className="text-2xl font-black mt-1 block text-[#2F2925]">{totalCount}</span>
            <span className="text-[11px] mt-1 block text-[#8B7355]/80">Submissions to date</span>
          </div>

          <div className="border p-4 rounded-2xl relative overflow-hidden bg-amber-50/80 border-amber-200 shadow-xs">
            <span className="text-xs font-bold block flex items-center gap-1 text-amber-900">
              <Clock className="w-3.5 h-3.5" /> Pending Review
            </span>
            <span className="text-2xl font-black mt-1 block text-amber-950">{pendingCount}</span>
          </div>

          <div className="border p-4 rounded-2xl relative overflow-hidden bg-blue-50/80 border-blue-200 shadow-xs">
            <span className="text-xs font-bold block flex items-center gap-1 text-blue-900">
              <RefreshCw className="w-3.5 h-3.5" /> In Progress
            </span>
            <span className="text-2xl font-black mt-1 block text-blue-950">{inProgressCount}</span>
            <span className="text-[11px] mt-1 block text-blue-700">Being resolved</span>
          </div>

          <div className="border p-4 rounded-2xl bg-emerald-50/80 border-emerald-200 shadow-xs">
            <span className="text-xs font-bold block text-emerald-900">Completed</span>
            <span className="text-2xl font-black mt-1 block text-emerald-950">{completedCount}</span>
            <span className="text-[11px] mt-1 block text-emerald-700">Resolved issues</span>
          </div>

          <div className="border p-4 rounded-2xl relative overflow-hidden bg-rose-50/80 border-rose-200 shadow-xs">
            <span className="text-xs font-bold block flex items-center gap-1 text-rose-900">
              <ShieldCheck className="w-3.5 h-3.5" /> Escalated
            </span>
            <span className="text-2xl font-black mt-1 block text-rose-950">{escalatedCount}</span>
            <span className="text-[11px] mt-1 block text-rose-700">To authorities</span>
          </div>

          <div className="border p-4 rounded-2xl bg-[#FDF0DC] border-[#E8D8C4] shadow-xs">
            <span className="text-xs font-bold block flex items-center gap-1 text-[#B85228]">
              <TrendingUp className="w-3.5 h-3.5 text-[#EB8055]" /> Avg Hostel Rating
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-[#2F2925]">{avgRating}</span>
              <div className="flex text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <span className="text-[11px] mt-1 block text-[#8B7355]">Out of 5.0 Stars</span>
          </div>
        </div>

        {/* FILTER & SEARCH TOOLBAR */}
        <div className="border p-4 rounded-2xl shadow-xs bg-white border-[#E8D8C4] flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[130px]">
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] shadow-xs cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex-1 min-w-[130px]">
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] shadow-xs cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Overall Experience">Overall Experience</option>
              <option value="Water Supply & Plumbing">Water Supply & Plumbing</option>
              <option value="Room Cleaning & Sanitation">Room Cleaning & Sanitation</option>
              <option value="Furniture & Electrical">Furniture & Electrical</option>
              <option value="Food & Mess Quality">Food & Mess Quality</option>
              <option value="Internet & Wi-Fi">Internet & Wi-Fi</option>
            </select>
          </div>

          <div className="flex-1 min-w-[130px]">
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] shadow-xs cursor-pointer"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div className="flex-1 min-w-[130px]">
            <label className="block text-[10px] uppercase tracking-wider font-bold mb-1 text-[#8B7355]">Escalation</label>
            <select
              value={escalationFilter}
              onChange={(e) => setEscalationFilter(e.target.value)}
              className="w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] shadow-xs cursor-pointer"
            >
              <option value="All">All Feedback</option>
              <option value="Escalated">Escalated Only</option>
              <option value="Not Escalated">Not Escalated</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchData();
                setShowEscalationUpdates(true);
              }}
              className="flex items-center justify-center gap-1.5 px-4 h-[30px] text-xs font-bold rounded-lg transition-all cursor-pointer border bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" /> Escalation Updates
            </button>
            <button
              onClick={() => {
                setStatusFilter('All');
                setCategoryFilter('All');
                setRatingFilter('All');
                setEscalationFilter('All');
                setSearch('');
                fetchData();
              }}
              className="flex items-center justify-center gap-1.5 px-4 h-[30px] text-xs font-bold rounded-lg transition-all cursor-pointer border bg-[#FDF0DC] hover:bg-[#F5E8D4] text-[#2F2925] border-[#E8D8C4]"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* FEEDBACK DATA TABLE */}
        <div className="border rounded-2xl shadow-xs overflow-hidden bg-white border-[#E8D8C4]">
          <div className="p-4 border-b flex items-center justify-between border-[#E8D8C4]/60 bg-[#FDF0DC]/30">
            <h3 className="text-sm font-bold flex items-center gap-2 text-[#2F2925]">
              Student Feedback Records ({filteredFeedbacks.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#8B7355]">
              <div className="w-6 h-6 border-2 border-[#EB8055] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading feedback records...
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="p-12 text-center font-medium text-[#8B7355]">
              No feedback records match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="uppercase text-[10px] tracking-wider border-b bg-[#FDF0DC]/50 text-[#8B7355] border-[#E8D8C4] font-bold">
                  <tr>
                    <th className="p-3.5 font-bold">Feedback ID</th>
                    <th className="p-3.5 font-bold">Room & Block</th>
                    <th className="p-3.5 font-bold">Category</th>
                    <th className="p-3.5 font-bold">Feedback Message</th>
                    <th className="p-3.5 font-bold">Rating</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8D8C4]/40 text-[#2F2925] font-medium">
                  {filteredFeedbacks.map((item) => (
                    <tr key={item._id} className="transition-colors hover:bg-[#FDF0DC]/20">
                      {/* Student ID */}
                      <td className="p-3.5 font-bold">
                        <span className="px-2 py-1 rounded-md border font-bold text-xs bg-[#FDF0DC] text-[#B85228] border-[#E8D8C4]" title="Feedback ID">
                          {item._id ? item._id.slice(-8).toUpperCase() : "UNKNOWN"}
                        </span>
                      </td>

                      {/* Room & Block */}
                      <td className="p-3.5 font-semibold">
                        <div className="text-[#2F2925]">Room {item.RoomNo}</div>
                        <div className="text-[10px] text-[#8B7355]">{item.Block}</div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block bg-[#FDF0DC] text-[#EB8055] border-[#E8D8C4]">
                          {item.category || 'Overall Experience'}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="p-3.5 max-w-sm">
                        <div className="font-semibold line-clamp-2 text-[#2F2925]">
                          {item.message}
                        </div>
                        {item.imageUrl && (
                          <div className="mt-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setLightboxImage(item.imageUrl.startsWith("http") ? item.imageUrl : `http://localhost:5000${item.imageUrl}`);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#EB8055] hover:text-[#D96B3A] cursor-pointer"
                            >
                              📷 View Attached Photo
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="font-bold text-xs">{item.rating}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1.5 items-start">
                          {getStatusBadge(item.status)}
                          {item.isEscalated && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wide bg-rose-100 text-rose-700 border border-rose-200" title="This ticket has been escalated">
                              Escalated to {item.escalationAuthority}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedFeedback(item)}
                            className="px-3 py-1.5 bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                          >
                            Update Status
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg border border-rose-500/20 transition-all cursor-pointer"
                            title="Delete Feedback"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* RESOLVE MODAL */}
      {selectedFeedback && (
        <ResolveFeedbackModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          onSuccess={handleUpdateSuccess}
          onEscalate={setEscalateFeedback}
        />
      )}

      {/* ESCALATE MODAL */}
      {escalateFeedback && (
        <EscalateModal
          feedback={escalateFeedback}
          onClose={() => setEscalateFeedback(null)}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* ESCALATION UPDATES MODAL */}
      {showEscalationUpdates && (
        <EscalationUpdatesModal
          feedbacks={feedbacks}
          onClose={() => setShowEscalationUpdates(false)}
        />
      )}

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
    </div>
  );
}
