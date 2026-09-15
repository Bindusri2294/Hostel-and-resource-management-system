import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { feedbackService } from '../../services/feedbackService';
import ResolveFeedbackModal from './ResolveFeedbackModal';
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
  Sun,
  Moon
} from 'lucide-react';

export default function AdminFeedbackDashboard() {
  const { user, logout } = useAuth();
  const { isBright, toggleTheme } = useTheme();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modal State
  const [selectedFeedback, setSelectedFeedback] = useState(null);

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
  const avgRating =
    totalCount > 0
      ? (feedbacks.reduce((sum, f) => sum + Number(f.rating || 0), 0) / totalCount).toFixed(1)
      : '0.0';

  // Apply filters
  const filteredFeedbacks = feedbacks.filter((item) => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && (item.category || 'Overall Experience') !== categoryFilter) return false;
    if (ratingFilter !== 'All' && String(item.rating) !== String(ratingFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchMsg = item.message?.toLowerCase().includes(q);
      const matchStudent = item.studentId?.toLowerCase().includes(q);
      const matchRoom = item.RoomNo?.toLowerCase().includes(q);
      const matchBlock = item.Block?.toLowerCase().includes(q);
      const matchCategory = item.category?.toLowerCase().includes(q);
      return matchMsg || matchStudent || matchRoom || matchBlock || matchCategory;
    }
    return true;
  });

  const getStatusBadge = (st) => {
    if (st === 'Completed') {
      return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
          isBright
            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          <CheckCircle2 className="w-3 h-3" /> Completed
        </span>
      );
    }
    if (st === 'In Progress') {
      return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
          isBright
            ? 'bg-blue-100 text-blue-900 border-blue-300'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          <RefreshCw className="w-3 h-3" /> In Progress
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
        isBright
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      }`}>
        <Clock className="w-3 h-3" /> Pending Review
      </span>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isBright ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Header Bar */}
      <header className={`border-b sticky top-0 z-30 backdrop-blur-lg transition-colors ${
        isBright ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-slate-900/80 border-slate-800/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 border rounded-xl flex items-center justify-center ${
              isBright ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-base font-bold flex items-center gap-2 ${isBright ? 'text-slate-900' : 'text-white'}`}>
                Hostel Management Hub
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isBright ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                }`}>
                  Warden Admin View
                </span>
              </h1>
              <p className={`text-xs ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Logged in as: <strong className={isBright ? 'text-slate-900' : 'text-slate-200'}>{user?.email || user?.name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bright Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                isBright
                  ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 shadow-sm'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-amber-400 border-slate-700/60'
              }`}
            >
              {isBright ? <Moon className="w-3.5 h-3.5 text-indigo-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isBright ? 'Dark Mode' : 'Bright Mode'}</span>
            </button>

            <button
              onClick={logout}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isBright
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/60'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* KPI STATS HEADER CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className={`border p-4 rounded-2xl ${
            isBright ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <span className={`text-xs font-semibold block ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>Total Feedback</span>
            <span className={`text-2xl font-black mt-1 block ${isBright ? 'text-slate-900' : 'text-white'}`}>{totalCount}</span>
            <span className={`text-[11px] mt-1 block ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>Submissions to date</span>
          </div>

          <div className={`border p-4 rounded-2xl relative overflow-hidden ${
            isBright ? 'bg-amber-50/80 border-amber-200 shadow-md' : 'bg-slate-900/60 border-amber-800/40'
          }`}>
            <span className={`text-xs font-bold block flex items-center gap-1 ${isBright ? 'text-amber-900' : 'text-amber-400'}`}>
              <Clock className="w-3.5 h-3.5" /> Pending Review
            </span>
            <span className={`text-2xl font-black mt-1 block ${isBright ? 'text-amber-950' : 'text-amber-300'}`}>{pendingCount}</span>
          </div>

          <div className={`border p-4 rounded-2xl relative overflow-hidden ${
            isBright ? 'bg-blue-50/80 border-blue-200 shadow-md' : 'bg-slate-900/60 border-blue-800/40'
          }`}>
            <span className={`text-xs font-bold block flex items-center gap-1 ${isBright ? 'text-blue-900' : 'text-blue-400'}`}>
              <RefreshCw className="w-3.5 h-3.5" /> In Progress
            </span>
            <span className={`text-2xl font-black mt-1 block ${isBright ? 'text-blue-950' : 'text-blue-300'}`}>{inProgressCount}</span>
            <span className={`text-[11px] mt-1 block ${isBright ? 'text-blue-700' : 'text-slate-500'}`}>Being resolved</span>
          </div>

          <div className={`border p-4 rounded-2xl ${
            isBright ? 'bg-emerald-50/80 border-emerald-200 shadow-md' : 'bg-slate-900/60 border-emerald-800/40'
          }`}>
            <span className={`text-xs font-bold block ${isBright ? 'text-emerald-900' : 'text-emerald-400'}`}>Completed</span>
            <span className={`text-2xl font-black mt-1 block ${isBright ? 'text-emerald-950' : 'text-emerald-300'}`}>{completedCount}</span>
            <span className={`text-[11px] mt-1 block ${isBright ? 'text-emerald-700' : 'text-slate-500'}`}>Resolved issues</span>
          </div>

          <div className={`border p-4 rounded-2xl ${
            isBright ? 'bg-indigo-50/80 border-indigo-200 shadow-md' : 'bg-slate-900/60 border-indigo-800/40'
          }`}>
            <span className={`text-xs font-bold block flex items-center gap-1 ${isBright ? 'text-indigo-900' : 'text-indigo-400'}`}>
              <TrendingUp className="w-3.5 h-3.5" /> Avg Hostel Rating
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-2xl font-black ${isBright ? 'text-slate-900' : 'text-white'}`}>{avgRating}</span>
              <div className="flex text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
            </div>
            <span className={`text-[11px] mt-1 block ${isBright ? 'text-slate-600' : 'text-slate-500'}`}>Out of 5.0 Stars</span>
          </div>
        </div>

        {/* FILTER & SEARCH TOOLBAR */}
        <div className={`border p-4 rounded-2xl shadow-lg space-y-3 ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isBright ? 'text-slate-400' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search by student roll no, room, block, or message..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full border rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium focus:outline-none ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:bg-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                }`}
              />
            </div>

            <button
              onClick={fetchData}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border ${
                isBright
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t ${
            isBright ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <div>
              <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${
                isBright ? 'text-slate-600' : 'text-slate-400'
              }`}>Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600 focus:bg-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                }`}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${
                isBright ? 'text-slate-600' : 'text-slate-400'
              }`}>Category Filter</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600 focus:bg-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                }`}
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

            <div>
              <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${
                isBright ? 'text-slate-600' : 'text-slate-400'
              }`}>Star Rating</label>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className={`w-full border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${
                  isBright
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600 focus:bg-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500'
                }`}
              >
                <option value="All">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* FEEDBACK DATA TABLE */}
        <div className={`border rounded-2xl shadow-xl overflow-hidden ${
          isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className={`p-4 border-b flex items-center justify-between ${
            isBright ? 'border-slate-200 bg-slate-50' : 'border-slate-800'
          }`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${
              isBright ? 'text-slate-900' : 'text-white'
            }`}>
              Student Feedback Records ({filteredFeedbacks.length})
            </h3>
          </div>

          {loading ? (
            <div className={`p-12 text-center ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading feedback records...
            </div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className={`p-12 text-center font-medium ${isBright ? 'text-slate-600' : 'text-slate-500'}`}>
              No feedback records match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className={`uppercase text-[10px] tracking-wider border-b ${
                  isBright ? 'bg-slate-100 text-slate-700 border-slate-200 font-bold' : 'bg-slate-950/80 text-slate-400 border-slate-800'
                }`}>
                  <tr>
                    <th className="p-3.5 font-bold">Student ID</th>
                    <th className="p-3.5 font-bold">Room & Block</th>
                    <th className="p-3.5 font-bold">Category</th>
                    <th className="p-3.5 font-bold">Feedback Message</th>
                    <th className="p-3.5 font-bold">Rating</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isBright ? 'divide-slate-200 text-slate-900 font-medium' : 'divide-slate-800/60 text-slate-300'}`}>
                  {filteredFeedbacks.map((item) => (
                    <tr key={item._id} className={`transition-colors ${isBright ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                      {/* Student ID */}
                      <td className="p-3.5 font-bold">
                        <span className={`px-2 py-1 rounded border font-bold text-xs ${
                          isBright ? 'bg-blue-50 text-blue-800 border-blue-200' : 'bg-blue-950 text-blue-300 border-blue-800'
                        }`}>
                          {item.studentId}
                        </span>
                      </td>

                      {/* Room & Block */}
                      <td className="p-3.5 font-semibold">
                        <div className={isBright ? 'text-slate-900' : 'text-white'}>Room {item.RoomNo}</div>
                        <div className={`text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>{item.Block}</div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block ${
                          isBright
                            ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                            : 'bg-indigo-950/80 text-indigo-300 border-indigo-800'
                        }`}>
                          {item.category || 'Overall Experience'}
                        </span>
                      </td>

                      {/* Message */}
                      <td className="p-3.5 max-w-sm">
                        <div className={`font-semibold line-clamp-2 ${isBright ? 'text-slate-900' : 'text-slate-200'}`}>
                          {item.message}
                        </div>
                        {item.imageUrl && (
                          <div className="mt-1.5">
                            <a
                              href={`http://localhost:5000${item.imageUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 underline"
                            >
                              📷 View Attached Photo
                            </a>
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
                      <td className="p-3.5">{getStatusBadge(item.status)}</td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedFeedback(item)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs shadow transition-all cursor-pointer"
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
        />
      )}
    </div>
  );
}
