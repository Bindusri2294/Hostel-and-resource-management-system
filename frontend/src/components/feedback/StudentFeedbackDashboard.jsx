import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { feedbackService } from '../../services/feedbackService';
import {
  MessageSquarePlus,
  History,
  Star,
  Upload,
  EyeOff,
  Send,
  LogOut,
  UserCheck,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileImage,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

export default function StudentFeedbackDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'my-tickets'

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food/Mess');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [priority, setPriority] = useState('Medium');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // My Tickets State
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const categories = [
    'Food/Mess',
    'Cleanliness & Sanitation',
    'Maintenance & Repairs',
    'Water & Electricity',
    'Wi-Fi & Internet',
    'Warden & Staff',
    'Other',
  ];

  const ratingLabels = ['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent'];

  const fetchMyTickets = async () => {
    setLoadingTickets(true);
    try {
      const data = await feedbackService.getMyFeedbacks();
      setMyTickets(data);
    } catch (err) {
      toast.error('Failed to fetch your feedbacks');
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-tickets') {
      fetchMyTickets();
    }
  }, [activeTab]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please enter title and description');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('rating', rating);
      formData.append('priority', priority);
      formData.append('isAnonymous', isAnonymous);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await feedbackService.createFeedback(formData);

      toast.success('Feedback submitted successfully!');

      // Reset form
      setTitle('');
      setDescription('');
      setRating(5);
      setPriority('Medium');
      setIsAnonymous(false);
      setImageFile(null);
      setImagePreview('');

      // Switch to my tickets
      setActiveTab('my-tickets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Closed / Declined
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'Urgent':
        return <span className="text-xs font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">Urgent</span>;
      case 'High':
        return <span className="text-xs font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">High Priority</span>;
      case 'Medium':
        return <span className="text-xs text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/40">Medium</span>;
      default:
        return <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">Low</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-lg sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                Hostel Student Portal
                <span className="text-xs font-normal text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800">
                  Student View
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Logged in as: <strong className="text-slate-200">{user?.name}</strong> {user?.student?.rollNo && `(${user.student.rollNo})`}
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
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-4">
          <button
            onClick={() => setActiveTab('submit')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'submit'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" /> Submit Feedback / Report Issue
          </button>

          <button
            onClick={() => setActiveTab('my-tickets')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'my-tickets'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" /> My Submissions ({myTickets.length})
          </button>
        </div>

        {/* TAB 1: SUBMIT FEEDBACK */}
        {activeTab === 'submit' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Form */}
            <div className="md:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" /> Express Your Feedback
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Share your suggestions, complaints, or maintenance issues directly with hostel management.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Category & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority Level</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Low">Low (General suggestion)</option>
                      <option value="Medium">Medium (Normal requirement)</option>
                      <option value="High">High (Requires prompt action)</option>
                      <option value="Urgent">Urgent (Breakage / Critical issue)</option>
                    </select>
                  </div>
                </div>

                {/* Rating Widget */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Rating / Overall Satisfaction
                  </label>
                  <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-slate-600 hover:scale-110 transition-all cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (hoverRating || rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-medium text-amber-300 ml-2">
                      {ratingLabels[(hoverRating || rating) - 1]}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Title / Subject *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Water leak in Room B-204 bathroom / Mess food quality"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Description *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Explain the problem or suggestion clearly..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
                  />
                </div>

                {/* Anonymous Toggle */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="anonymousCheck"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <label htmlFor="anonymousCheck" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer">
                      <EyeOff className="w-3.5 h-3.5 text-amber-400" /> Submit Anonymously
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Your identity (name & roll number) will be hidden from the Warden Admin view. You will still be able to view and track resolution under your "My Submissions" tab.
                    </p>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Optional Photo Attachment (Maintenance / Facility Issue)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-blue-400" /> Choose Photo
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>

                    {imagePreview && (
                      <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                        <img src={imagePreview} alt="Preview" className="w-8 h-8 object-cover rounded" />
                        <span className="text-[11px] text-slate-300 max-w-[120px] truncate">{imageFile?.name}</span>
                        <button
                          type="button"
                          onClick={() => { setImageFile(null); setImagePreview(''); }}
                          className="text-rose-400 hover:text-rose-300 text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl shadow-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Feedback Ticket
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar Student Card */}
            <div className="space-y-4">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-400" /> Automatic Student Profile
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Name</span>
                    <span className="font-semibold text-white">{user?.name}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Roll Number</span>
                    <span className="font-semibold text-blue-300">{user?.student?.rollNo || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Room Number & Hostel</span>
                    <span className="font-semibold text-emerald-400">
                      {user?.student?.roomNo ? `Room ${user.student.roomNo}` : 'General'} ({user?.student?.campus || 'Main Campus'})
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl text-[11px] text-blue-200">
                  🔒 Your Student ID is automatically linked securely by the server token. You do not need to manually enter your roll number.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY SUBMISSIONS */}
        {activeTab === 'my-tickets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-400" /> Your Submitted Tickets
              </h2>
              <button
                onClick={fetchMyTickets}
                className="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Refresh List
              </button>
            </div>

            {loadingTickets ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading your feedback tickets...
              </div>
            ) : myTickets.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
                <FileImage className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No Feedback Submitted Yet</p>
                <p className="text-xs text-slate-500 mt-1">You haven't submitted any feedback tickets yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3 transition-all hover:border-slate-700"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-semibold text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded-full border border-blue-800">
                            {ticket.category}
                          </span>
                          {getPriorityBadge(ticket.priority)}
                          {ticket.isAnonymous && (
                            <span className="text-xs font-medium text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40 flex items-center gap-1">
                              <EyeOff className="w-3 h-3" /> Submitted Anonymously
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white">{ticket.title}</h3>
                      </div>

                      <div>{getStatusBadge(ticket.status)}</div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                      {ticket.description}
                    </p>

                    {/* Image Attachment & Rating Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1 border-t border-slate-800/60 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Rating:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= ticket.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {ticket.imageUrl && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">Attachment:</span>
                          <a
                            href={ticket.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 underline"
                          >
                            <FileImage className="w-3.5 h-3.5" /> View Photo
                          </a>
                        </div>
                      )}

                      <span className="text-[11px] text-slate-500">
                        Submitted: {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Warden Admin Official Response Section */}
                    {ticket.adminResponse && (
                      <div className="mt-3 p-3.5 bg-indigo-950/40 border border-indigo-800/50 rounded-xl text-xs space-y-1">
                        <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-indigo-400" /> Warden Admin Response:
                        </div>
                        <p className="text-slate-200 text-xs leading-relaxed pl-5">{ticket.adminResponse}</p>
                        {ticket.respondedAt && (
                          <div className="text-[10px] text-indigo-400/80 text-right">
                            Responded: {new Date(ticket.respondedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
