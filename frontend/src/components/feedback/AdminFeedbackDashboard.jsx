import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { feedbackService } from '../../services/feedbackService';
import ResolveFeedbackModal from './ResolveFeedbackModal';
import {
  ShieldCheck,
  LogOut,
  Search,
  Filter,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  EyeOff,
  FileImage,
  RefreshCw,
  TrendingUp,
  SlidersHorizontal,
  Building
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFeedbackDashboard() {
  const { user, logout } = useAuth();
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [rating, setRating] = useState('All');
  const [search, setSearch] = useState('');

  // Selected Ticket for Modal
  const [selectedTicket, setSelectedTicket] = useState(null);

  const categories = [
    'All',
    'Food/Mess',
    'Cleanliness & Sanitation',
    'Maintenance & Repairs',
    'Water & Electricity',
    'Wi-Fi & Internet',
    'Warden & Staff',
    'Other',
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketsData, statsData] = await Promise.all([
        feedbackService.getAllFeedbacks({ category, status, priority, rating, search }),
        feedbackService.getFeedbackStats(),
      ]);
      setFeedbacks(ticketsData);
      setStats(statsData);
    } catch (err) {
      toast.error('Failed to load dashboard feedback data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, status, priority, rating, search]);

  const handleTicketSuccess = (updatedTicket) => {
    setFeedbacks((prev) =>
      prev.map((t) => (t._id === updatedTicket._id ? updatedTicket : t))
    );
    fetchData();
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <RefreshCw className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'Urgent':
        return <span className="text-[11px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">Urgent</span>;
      case 'High':
        return <span className="text-[11px] font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">High</span>;
      case 'Medium':
        return <span className="text-[11px] text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60">Medium</span>;
      default:
        return <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Low</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Hostel Management Hub
                <span className="text-xs font-semibold text-indigo-300 bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-800">
                  Warden Admin View
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Warden Account: <strong className="text-slate-200">{user?.email}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700/60 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* KPI STATS HEADER */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-medium text-slate-400 block">Total Tickets</span>
              <span className="text-2xl font-black text-white mt-1 block">{stats.totalFeedbacks}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Submissions to date</span>
            </div>

            <div className="bg-slate-900/60 border border-amber-800/40 p-4 rounded-2xl relative overflow-hidden">
              <span className="text-xs font-medium text-amber-400 block flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Pending Review
              </span>
              <span className="text-2xl font-black text-amber-300 mt-1 block">{stats.pendingCount}</span>
              {stats.urgentPendingCount > 0 && (
                <span className="text-[10px] text-rose-400 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60 inline-block mt-1">
                  ⚠️ {stats.urgentPendingCount} Urgent Priority
                </span>
              )}
            </div>

            <div className="bg-slate-900/60 border border-blue-800/40 p-4 rounded-2xl">
              <span className="text-xs font-medium text-blue-400 block">In Progress</span>
              <span className="text-2xl font-black text-blue-300 mt-1 block">{stats.inProgressCount}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Work initiated</span>
            </div>

            <div className="bg-slate-900/60 border border-emerald-800/40 p-4 rounded-2xl">
              <span className="text-xs font-medium text-emerald-400 block">Resolved</span>
              <span className="text-2xl font-black text-emerald-300 mt-1 block">{stats.resolvedCount}</span>
              <span className="text-[11px] text-slate-500 mt-1 block">Issues closed</span>
            </div>

            <div className="bg-slate-900/60 border border-indigo-800/40 p-4 rounded-2xl col-span-2 lg:col-span-1">
              <span className="text-xs font-medium text-indigo-400 block flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Avg Hostel Rating
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-black text-white">{stats.averageRating}</span>
                <div className="flex text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Out of 5.0 Stars</span>
            </div>
          </div>
        )}

        {/* CATEGORY RATING ANALYTICS BREAKDOWN */}
        {stats?.categoryStats?.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Category Satisfaction & Ticket Volume
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {stats.categoryStats.map((item) => (
                <div key={item._id} className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 truncate">{item._id}</span>
                    <span className="text-slate-400 text-[11px]">{item.count} tickets</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-bold">{item.avgRating ? item.avgRating.toFixed(1) : 0}</span>
                    </div>
                    <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-indigo-500 h-full rounded-full"
                        style={{ width: `${((item.avgRating || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FILTER & SEARCH TOOLBAR */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-lg space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket title, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">Star Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
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
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Student Feedback Records ({feedbacks.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading tickets...
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No feedback tickets match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 font-bold">Student</th>
                    <th className="p-3.5 font-bold">Issue Title & Category</th>
                    <th className="p-3.5 font-bold">Priority</th>
                    <th className="p-3.5 font-bold">Rating</th>
                    <th className="p-3.5 font-bold">Status</th>
                    <th className="p-3.5 font-bold">Photo</th>
                    <th className="p-3.5 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {feedbacks.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Student Info / Anonymous Masking */}
                      <td className="p-3.5 font-medium">
                        {ticket.isAnonymous ? (
                          <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/40 px-2 py-1 rounded border border-amber-800/40 w-fit">
                            <EyeOff className="w-3.5 h-3.5" />
                            <span className="font-bold text-[11px]">Anonymous Student</span>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-white text-xs">{ticket.student?.name || 'Student'}</div>
                            <div className="text-[10px] text-slate-400">
                              {ticket.student?.rollNo} • Room {ticket.student?.roomNo || 'N/A'}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Issue & Category */}
                      <td className="p-3.5 max-w-xs">
                        <span className="text-[10px] font-semibold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800 inline-block mb-1">
                          {ticket.category}
                        </span>
                        <div className="font-semibold text-white truncate">{ticket.title}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{ticket.description}</div>
                      </td>

                      {/* Priority */}
                      <td className="p-3.5">{getPriorityBadge(ticket.priority)}</td>

                      {/* Rating */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-0.5 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span className="font-bold text-xs">{ticket.rating}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">{getStatusBadge(ticket.status)}</td>

                      {/* Attachment */}
                      <td className="p-3.5">
                        {ticket.imageUrl ? (
                          <a
                            href={ticket.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-semibold underline text-[11px]"
                          >
                            <FileImage className="w-3.5 h-3.5" /> View Photo
                          </a>
                        ) : (
                          <span className="text-slate-600 text-[11px]">None</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg text-xs shadow transition-all cursor-pointer"
                        >
                          Manage Ticket
                        </button>
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
      {selectedTicket && (
        <ResolveFeedbackModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSuccess={handleTicketSuccess}
        />
      )}
    </div>
  );
}
