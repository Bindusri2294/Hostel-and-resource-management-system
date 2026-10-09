import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { feedbackService } from '../../services/feedbackService';
import {
  MessageSquarePlus,
  History,
  Star,
  Send,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  UploadCloud,
  X
} from 'lucide-react';

export default function StudentFeedbackDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('submit'); // 'submit' | 'my-feedbacks'

  // Form State derived strictly from authenticated student profile
  const [studentId, setStudentId] = useState(user?.student?.Rollno || '');
  const [roomNo, setRoomNo] = useState(user?.student?.Roomno || '');
  const [block, setBlock] = useState(user?.student?.Block || 'Block A');
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
  const [lightboxImage, setLightboxImage] = useState(null);

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
      if (user.student.Block) setBlock(user.student.Block);
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
    const activeBlock = user?.student?.Block || block || 'Block A';

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
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border bg-emerald-100 text-emerald-900 border-emerald-300`}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Completed
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border bg-blue-100 text-blue-900 border-blue-300`}>
          <RefreshCw className="w-3.5 h-3.5" /> In Progress
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border bg-amber-100 text-amber-900 border-amber-300`}>
        <Clock className="w-3.5 h-3.5" /> Pending Review
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Navigation Tabs */}
        <div className="flex border-b gap-4 border-[#E8D8C4]">
          <button
            onClick={() => setActiveTab('submit')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'submit'
                ? 'border-[#EB8055] text-[#EB8055]'
                : 'border-transparent text-[#8B7355] hover:text-[#2F2925]'
            }`}
          >
            <MessageSquarePlus className="w-4 h-4" /> Submit Feedback / Report Issue
          </button>

          <button
            onClick={() => setActiveTab('my-feedbacks')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'my-feedbacks'
                ? 'border-[#EB8055] text-[#EB8055]'
                : 'border-transparent text-[#8B7355] hover:text-[#2F2925]'
            }`}
          >
            <History className="w-4 h-4" /> My Submissions ({myFeedbacks.length})
          </button>
        </div>

        {/* TAB 1: SUBMIT FEEDBACK */}
        {activeTab === 'submit' && (
          <div className="border rounded-2xl p-6 shadow-xs bg-white border-[#E8D8C4]">
              <div className="mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2 text-[#2F2925]">
                  <Sparkles className="w-5 h-5 text-[#EB8055]" /> Express Your Feedback
                </h2>
                <p className="text-xs mt-0.5 text-[#8B7355]">
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
                    <label className="block text-xs font-semibold mb-1.5 text-[#2F2925]">
                      Student ID (Roll No)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={user?.student?.Rollno || studentId || 'N/A'}
                        className="w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold select-none bg-[#FDF0DC]/30 border-[#E8D8C4] text-[#8B7355]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#2F2925]">
                      Room Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={user?.student?.Roomno || roomNo || 'Unassigned'}
                        className="w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold select-none bg-[#FDF0DC]/30 border-[#E8D8C4] text-[#8B7355]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-[#2F2925]">
                      Hostel Block
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        disabled
                        value={user?.student?.Block || block || 'Block A'}
                        className="w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold select-none bg-[#FDF0DC]/30 border-[#E8D8C4] text-[#8B7355]"
                      />
                    </div>
                  </div>
                </div>

                {/* Feedback Category Selection */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#2F2925]">
                    Feedback Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none bg-white border-[#E8D8C4] text-[#2F2925] focus:border-[#EB8055] shadow-xs cursor-pointer"
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
                  <label className="block text-xs font-semibold mb-1.5 text-[#2F2925]">
                    Rating / Overall Satisfaction *
                  </label>
                  <div className="flex items-center gap-2 p-3 rounded-xl border bg-[#FDF0DC]/30 border-[#E8D8C4]">
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
                                : 'text-slate-300 fill-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold ml-2 text-amber-800">
                      {ratingLabels[(hoverRating || rating) - 1]}
                    </span>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#2F2925]">
                    Feedback Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Explain the problem or suggestion clearly..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none resize-none bg-white border-[#E8D8C4] text-[#2F2925] placeholder-[#8B7355]/50 focus:border-[#EB8055] shadow-xs"
                  />
                </div>

                {/* Optional Image Attachment */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#2F2925]">
                    Attach Photo / Proof (Optional)
                  </label>
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all bg-[#FDF0DC]/20 border-[#E8D8C4] hover:border-[#EB8055] hover:bg-[#FDF0DC]/40 text-[#8B7355]">
                      <UploadCloud className="w-6 h-6 text-[#EB8055] mb-1" />
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
                    <div className="relative inline-block border rounded-xl overflow-hidden shadow-xs border-[#E8D8C4]">
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
                  className="w-full bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold py-3 rounded-xl shadow-xs text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
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
        )}

        {/* TAB 2: MY SUBMISSIONS */}
        {activeTab === 'my-feedbacks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-[#2F2925]">
                <History className="w-5 h-5 text-[#EB8055]" /> Your Submitted Feedback
              </h2>
              <button
                onClick={fetchMyFeedbacks}
                className="text-xs text-[#EB8055] hover:text-[#D96B3A] font-semibold underline cursor-pointer"
              >
                Refresh List
              </button>
            </div>

            {loadingFeedbacks ? (
              <div className="p-12 text-center text-[#8B7355]">
                <div className="w-6 h-6 border-2 border-[#EB8055] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading your feedback...
              </div>
            ) : myFeedbacks.length === 0 ? (
              <div className="p-12 text-center border rounded-2xl bg-white border-[#E8D8C4]">
                <p className="text-sm font-bold text-[#2F2925]">No Feedback Submitted Yet</p>
                <p className="text-xs mt-1 text-[#8B7355]">You haven't submitted any feedback yet.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {myFeedbacks.map((item) => (
                  <div
                    key={item._id}
                    className="border rounded-2xl p-5 shadow-xs space-y-3 transition-all bg-white border-[#E8D8C4] hover:border-[#EB8055]/50"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-[#FDF0DC] text-[#B85228] border-[#E8D8C4]">
                            Room {item.RoomNo} ({item.Block})
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-[#FDF0DC] text-[#EB8055] border-[#E8D8C4]">
                            {item.category || 'Overall Experience'}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#8B7355]">
                            ID: {item.studentId}
                          </span>
                        </div>
                        <p className="text-sm font-bold mt-1 text-[#2F2925]">{item.message}</p>
                        
                        {item.imageUrl && (
                          <div className="mt-2.5">
                            <button
                              type="button"
                              onClick={() => setLightboxImage(item.imageUrl.startsWith("http") ? item.imageUrl : `http://localhost:5000${item.imageUrl}`)}
                              className="inline-block border rounded-xl overflow-hidden shadow hover:opacity-90 transition-all cursor-pointer"
                            >
                              <img
                                src={item.imageUrl.startsWith("http") ? item.imageUrl : `http://localhost:5000${item.imageUrl}`}
                                alt="Issue attachment"
                                className="h-32 w-auto object-cover rounded-xl block"
                              />
                            </button>
                          </div>
                        )}
                      </div>

                      <div>{getStatusBadge(item.status)}</div>
                    </div>

                    {/* Rating & Submission Date */}
                    <div className={`flex flex-wrap items-center justify-between gap-4 pt-2 border-t text-xs border-slate-200 text-slate-600`}>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Rating:</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= item.rating
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300 fill-slate-200'
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
