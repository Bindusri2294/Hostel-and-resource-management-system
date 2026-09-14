import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { feedbackService } from '../../services/feedbackService';
import {
  MessageSquarePlus,
  History,
  Star,
  Send,
  LogOut,
  UserCheck,
  Building,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  Sun,
  Moon,
  Lock,
  UploadCloud,
  ImageIcon,
  X
} from 'lucide-react';

export default function StudentFeedbackDashboard() {
  const { user, logout } = useAuth();
  const { isBright, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'my-feedbacks'

  // Form State derived strictly from authenticated student profile
  const [studentId, setStudentId] = useState(user?.student?.Rollno || '');
  const [roomNo, setRoomNo] = useState(user?.student?.Roomno || '');
  const [block, setBlock] = useState(user?.student?.Campus || 'Block A');
  const [category, setCategory] = useState('Overall Experience');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Feedbacks State
  const [myFeedbacks, setMyFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const categoryOptions = [
    { value: 'Overall Experience', label: '⭐ Overall Experience' },
    { value: 'Water Supply & Plumbing', label: '🚰 Water Supply & Plumbing' },
    { value: 'Room Cleaning & Sanitation', label: '🧹 Room Cleaning & Sanitation' },
    { value: 'Furniture & Electrical', label: '🪑 Furniture & Electrical' },
    { value: 'Food & Mess Quality', label: '🍽️ Food & Mess Quality' },
    { value: 'Internet & Wi-Fi', label: '📶 Internet & Wi-Fi' },
  ];

  const ratingLabels = ['1 - Poor', '2 - Fair', '3 - Good', '4 - Very Good', '5 - Excellent'];

  // Keep student fields updated when user context populates
  useEffect(() => {
    if (user?.student) {
      if (user.student.Rollno) setStudentId(user.student.Rollno);
      if (user.student.Roomno) setRoomNo(user.student.Roomno);
      if (user.student.Campus) setBlock(user.student.Campus);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormError('Please select a valid image file (JPG, PNG, WEBP, GIF).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size must be less than 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormError('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const fetchMyFeedbacks = async () => {
    setLoadingFeedbacks(true);
    try {
      const res = await feedbackService.getFeedbacks();
      // Filter strictly by current authenticated student's Roll Number
      const currentRoll = user?.student?.Rollno || studentId;
      const allData = Array.isArray(res.data) ? res.data : [];
      if (currentRoll) {
        const filtered = allData.filter(
          (f) => String(f.studentId).toLowerCase() === String(currentRoll).toLowerCase()
        );
        setMyFeedbacks(filtered);
      } else {
        setMyFeedbacks(allData);
      }
    } catch (err) {
      // Handle gracefully
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-feedbacks') {
      fetchMyFeedbacks();
    }
  }, [activeTab]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const activeStudentId = user?.student?.Rollno || studentId;
    const activeRoomNo = user?.student?.Roomno || roomNo;
    const activeBlock = user?.student?.Campus || block || 'Block A';

    if (!activeStudentId || !activeRoomNo || !message.trim()) {
      setFormError('Student details are incomplete or message is empty.');
      return;
    }

    setSubmitting(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('studentId', activeStudentId.trim());
        formData.append('RoomNo', activeRoomNo.trim());
        formData.append('Block', activeBlock.trim());
        formData.append('category', category);
        formData.append('message', message.trim());
        formData.append('rating', Number(rating) || 5);
        formData.append('image', imageFile);
        await feedbackService.createFeedback(formData);
      } else {
        await feedbackService.createFeedback({
          studentId: activeStudentId.trim(),
          RoomNo: activeRoomNo.trim(),
          Block: activeBlock.trim(),
          category,
          message: message.trim(),
          rating: Number(rating) || 5,
        });
      }

      setFormSuccess('Feedback submitted successfully!');
      setMessage('');
      setCategory('Overall Experience');
      setRating(5);
      setImageFile(null);
      setImagePreview('');

      // Refresh and switch tab after short delay
      setTimeout(() => {
        setFormSuccess('');
        setActiveTab('my-feedbacks');
      }, 1000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Completed') {
      return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
          isBright
            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
          isBright
            ? 'bg-blue-100 text-blue-900 border-blue-300'
            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        }`}>
          <RefreshCw className="w-3.5 h-3.5" /> In Progress
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
        isBright
          ? 'bg-amber-100 text-amber-900 border-amber-300'
          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      }`}>
        <Clock className="w-3.5 h-3.5" /> Pending Review
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
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 border rounded-xl flex items-center justify-center ${
              isBright ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-blue-600/20 border-blue-500/30 text-blue-400'
            }`}>
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-base font-bold flex items-center gap-2 ${isBright ? 'text-slate-900' : 'text-white'}`}>
                Hostel Student Portal
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  isBright ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-blue-950 text-blue-400 border-blue-800'
                }`}>
                  Student View
                </span>
              </h1>
              <p className={`text-xs ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Logged in as: <strong className={isBright ? 'text-slate-900' : 'text-slate-200'}>{user?.name}</strong> {user?.student?.Rollno && `(${user.student.Rollno})`}
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
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className={`flex border-b gap-4 ${isBright ? 'border-slate-300' : 'border-slate-800'}`}>
          <button
            onClick={() => setActiveTab('submit')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'submit'
                ? isBright ? 'border-blue-600 text-blue-700' : 'border-blue-500 text-blue-400'
                : isBright ? 'border-transparent text-slate-600 hover:text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" /> Submit Feedback / Report Issue
          </button>

          <button
            onClick={() => setActiveTab('my-feedbacks')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'my-feedbacks'
                ? isBright ? 'border-blue-600 text-blue-700' : 'border-blue-500 text-blue-400'
                : isBright ? 'border-transparent text-slate-600 hover:text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" /> My Submissions ({myFeedbacks.length})
          </button>
        </div>

        {/* TAB 1: SUBMIT FEEDBACK */}
        {activeTab === 'submit' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Form */}
            <div className={`md:col-span-2 border rounded-2xl p-6 shadow-xl ${
              isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800/80'
            }`}>
              <div className="mb-6">
                <h2 className={`text-lg font-bold flex items-center gap-2 ${isBright ? 'text-slate-900' : 'text-white'}`}>
                  <Sparkles className="w-5 h-5 text-blue-500" /> Express Your Feedback
                </h2>
                <p className={`text-xs mt-0.5 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  Share your suggestions, complaints, or maintenance issues directly with hostel management.
                </p>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {formSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-600 text-xs font-semibold">
                  {formSuccess}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Student ID / Roll No & Room & Block (Non-editable, locked to backend auth) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                      Student ID (Roll No)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={user?.student?.Rollno || studentId || 'N/A'}
                        className={`w-full border rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-bold cursor-not-allowed select-none ${
                          isBright
                            ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-inner'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      />
                      <Lock className={`w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                      Room Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={user?.student?.Roomno || roomNo || 'Unassigned'}
                        className={`w-full border rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-bold cursor-not-allowed select-none ${
                          isBright
                            ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-inner'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      />
                      <Lock className={`w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                      Hostel Block
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={user?.student?.Campus || block || 'Block A'}
                        className={`w-full border rounded-xl pl-3.5 pr-8 py-2.5 text-xs font-bold cursor-not-allowed select-none ${
                          isBright
                            ? 'bg-slate-100 border-slate-300 text-slate-800 shadow-inner'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      />
                      <Lock className={`w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 ${isBright ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                  </div>
                </div>

                {/* Feedback Category Selection */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                    Feedback Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600 focus:bg-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-blue-500'
                    }`}
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rating Widget */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                    Rating / Overall Satisfaction *
                  </label>
                  <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                    isBright ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
                  }`}>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-110 transition-all cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (hoverRating || rating)
                                ? 'fill-amber-400 text-amber-500'
                                : isBright ? 'text-slate-300 fill-slate-200' : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className={`text-xs font-bold ml-2 ${isBright ? 'text-amber-800' : 'text-amber-300'}`}>
                      {ratingLabels[(hoverRating || rating) - 1]}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                    Feedback Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Explain the problem or suggestion clearly..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none resize-none ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500'
                    }`}
                  />
                </div>

                {/* Optional Image Attachment */}
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                    Attach Photo / Proof (Optional)
                  </label>
                  {!imagePreview ? (
                    <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 text-slate-600'
                        : 'bg-slate-950 border-slate-800 hover:border-blue-500 hover:bg-slate-900 text-slate-400'
                    }`}>
                      <UploadCloud className="w-6 h-6 text-blue-500 mb-1" />
                      <span className="text-xs font-semibold">Click to upload issue photo</span>
                      <span className="text-[10px] opacity-70 mt-0.5">Supports JPG, PNG, WEBP (Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative inline-block border rounded-xl overflow-hidden shadow-sm">
                      <img src={imagePreview} alt="Issue preview" className="h-28 w-auto object-cover rounded-xl" />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-1.5 right-1.5 bg-rose-600 text-white p-1 rounded-full shadow hover:bg-rose-700 transition-all cursor-pointer"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Submit Feedback
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Sidebar Student Profile Card */}
            <div className="space-y-4">
              <div className={`border rounded-2xl p-5 shadow-xl ${
                isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800/80'
              }`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                  isBright ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  <UserCheck className="w-4 h-4 text-blue-600" /> Student Account Profile
                </h3>

                <div className="space-y-2 text-xs">
                  <div className={`p-2.5 rounded-lg border ${isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <span className={`block text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Name</span>
                    <span className={`font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>{user?.name || 'Student'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <span className={`block text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Roll Number</span>
                    <span className={`font-bold ${isBright ? 'text-blue-700' : 'text-blue-300'}`}>{user?.student?.Rollno || studentId || 'N/A'}</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isBright ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
                    <span className={`block text-[10px] ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Room & Hostel</span>
                    <span className={`font-bold ${isBright ? 'text-emerald-700' : 'text-emerald-400'}`}>
                      {user?.student?.Roomno ? `Room ${user.student.Roomno}` : roomNo ? `Room ${roomNo}` : 'General'} ({user?.student?.Campus || 'Main Campus'})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY SUBMISSIONS */}
        {activeTab === 'my-feedbacks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold flex items-center gap-2 ${isBright ? 'text-slate-900' : 'text-white'}`}>
                <History className="w-5 h-5 text-blue-600" /> Your Submitted Feedback
              </h2>
              <button
                onClick={fetchMyFeedbacks}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Refresh List
              </button>
            </div>

            {loadingFeedbacks ? (
              <div className={`p-12 text-center ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading your feedback...
              </div>
            ) : myFeedbacks.length === 0 ? (
              <div className={`p-12 text-center border rounded-2xl ${
                isBright ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800'
              }`}>
                <p className={`text-sm font-bold ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>No Feedback Submitted Yet</p>
                <p className={`text-xs mt-1 ${isBright ? 'text-slate-500' : 'text-slate-500'}`}>You haven't submitted any feedback yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myFeedbacks.map((item) => (
                  <div
                    key={item._id}
                    className={`border rounded-2xl p-5 shadow-lg space-y-3 transition-all ${
                      isBright ? 'bg-white border-slate-200 hover:border-slate-300' : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            isBright ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-blue-950 text-blue-400 border-blue-800'
                          }`}>
                            Room {item.RoomNo} ({item.Block})
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            isBright ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                          }`}>
                            {item.category || 'Overall Experience'}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            isBright ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                          }`}>
                            ID: {item.studentId}
                          </span>
                        </div>
                        <p className={`text-sm font-bold mt-1 ${isBright ? 'text-slate-900' : 'text-white'}`}>{item.message}</p>
                        
                        {item.imageUrl && (
                          <div className="mt-2.5">
                            <a
                              href={`http://localhost:5000${item.imageUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-block border rounded-xl overflow-hidden shadow hover:opacity-90 transition-all"
                            >
                              <img
                                src={`http://localhost:5000${item.imageUrl}`}
                                alt="Issue attachment"
                                className="h-32 w-auto object-cover rounded-xl"
                              />
                            </a>
                          </div>
                        )}
                      </div>

                      <div>{getStatusBadge(item.status)}</div>
                    </div>

                    {/* Rating & Submission Date */}
                    <div className={`flex flex-wrap items-center justify-between gap-4 pt-2 border-t text-xs ${
                      isBright ? 'border-slate-200 text-slate-600' : 'border-slate-800/60 text-slate-400'
                    }`}>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Rating:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= item.rating
                                  ? 'fill-amber-400 text-amber-500'
                                  : isBright ? 'text-slate-300 fill-slate-200' : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <span className="text-[11px] font-medium">
                        Submitted: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
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
