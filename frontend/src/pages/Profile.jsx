import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Plus, ShieldCheck, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { authService } from "../services/api";

export default function Profile() {
  const { user, setUser } = useAuth();
  const student = user?.student || {};

  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMsg, setContactMsg] = useState(null);

  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem(`profile_image_${user?._id || user?.id || user?.email || "current"}`) || null;
  });
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        setProfileImage(base64);
        localStorage.setItem(`profile_image_${user?._id || user?.id || user?.email || "current"}`, base64);
        window.dispatchEvent(new Event("storage"));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContactUpdate = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactMsg(null);
    try {
      const res = await authService.updateContact({ email, phone });
      if (setUser && res.data?.user) {
        const updated = { ...user, ...res.data.user };
        setUser(updated);
        localStorage.setItem("hostel_user", JSON.stringify(updated));
      }
      setContactMsg({ type: "success", text: "Contact information updated successfully!" });
    } catch (err) {
      setContactMsg({ type: "error", text: err.response?.data?.message || "Failed to update contact info." });
    } finally {
      setContactLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Details Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#E8D8C4] p-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-6">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
              title="Upload profile photo"
            >
              <div className="w-20 h-20 rounded-full bg-[#EB8055] text-white font-bold text-2xl shadow-sm border-2 border-white ring-2 ring-[#E8D8C4] flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (student?.Name || user?.name || "U").charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white text-[#EB8055] rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload} 
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2F2925]">{student?.Name || user?.name}</h2>
              <p className="text-sm font-medium text-[#8B7355] mt-1">{student?.Rollno || "Unassigned"}</p>
            </div>
          </div>
        </div>

        {/* Form Fields (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2F2925]">Full Name</label>
              <input 
                defaultValue={student?.Name || user?.name} 
                className="w-full h-11 px-3 rounded-xl bg-[#FDF0DC]/30 border border-[#E8D8C4] text-[#8B7355] font-medium focus-visible:outline-none" 
                readOnly
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2F2925]">Roll Number</label>
              <input 
                defaultValue={student?.Rollno || "—"} 
                className="w-full h-11 px-3 rounded-xl bg-[#FDF0DC]/30 border border-[#E8D8C4] text-[#8B7355] font-medium focus-visible:outline-none" 
                readOnly
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2F2925]">Course</label>
              <input 
                defaultValue={student?.Course || "—"} 
                className="w-full h-11 px-3 rounded-xl bg-[#FDF0DC]/30 border border-[#E8D8C4] text-[#8B7355] font-medium focus-visible:outline-none" 
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2F2925]">Academic Year</label>
              <input 
                defaultValue={student?.Year ? `Year ${student.Year}` : "—"} 
                className="w-full h-11 px-3 rounded-xl bg-[#FDF0DC]/30 border border-[#E8D8C4] text-[#8B7355] font-medium focus-visible:outline-none" 
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2F2925]">Campus</label>
              <input 
                defaultValue={student?.Campus || "—"} 
                className="w-full h-11 px-3 rounded-xl bg-[#FDF0DC]/30 border border-[#E8D8C4] text-[#8B7355] font-medium focus-visible:outline-none" 
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#E8D8C4] p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#FDF0DC] p-2.5 rounded-full text-[#EB8055]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-[17px] font-bold text-[#2F2925]">Contact Information</h3>
          </div>
          <span className="text-xs font-semibold text-[#8B7355]">Used for password recovery</span>
        </div>
        
        {contactMsg && (
          <div className={`mb-6 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${contactMsg.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'}`}>
            {contactMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {contactMsg.text}
          </div>
        )}

        <form onSubmit={handleContactUpdate}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2F2925]">Email Address</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter recovery email" 
                className="w-full h-11 px-3 rounded-xl bg-white border border-[#E8D8C4] text-[#2F2925] focus-visible:outline-none focus-visible:border-[#EB8055] focus-visible:ring-1 focus-visible:ring-[#EB8055]/30 placeholder-[#8B7355]/40" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#2F2925]">Phone Number</label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number" 
                className="w-full h-11 px-3 rounded-xl bg-white border border-[#E8D8C4] text-[#2F2925] focus-visible:outline-none focus-visible:border-[#EB8055] focus-visible:ring-1 focus-visible:ring-[#EB8055]/30 placeholder-[#8B7355]/40" 
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button 
              type="submit"
              disabled={contactLoading}
              className="h-11 px-8 rounded-xl bg-[#EB8055] text-white font-semibold hover:bg-[#D96B3A] shadow-md shadow-[#EB8055]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {contactLoading ? "Saving..." : "Save Contact Info"}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#E8D8C4] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#FDF0DC] p-2.5 rounded-full text-[#EB8055]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-[17px] font-bold text-[#2F2925]">Security & Password</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#2F2925]">Current Password</label>
            <input 
              type="password" 
              placeholder="Enter current password" 
              className="w-full h-11 px-3 rounded-xl bg-white border border-[#E8D8C4] text-[#2F2925] focus-visible:outline-none focus-visible:border-[#EB8055] focus-visible:ring-1 focus-visible:ring-[#EB8055]/30 placeholder-[#8B7355]/40" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#2F2925]">New Password</label>
            <input 
              type="password" 
              placeholder="Enter new password" 
              className="w-full h-11 px-3 rounded-xl bg-white border border-[#E8D8C4] text-[#2F2925] focus-visible:outline-none focus-visible:border-[#EB8055] focus-visible:ring-1 focus-visible:ring-[#EB8055]/30 placeholder-[#8B7355]/40" 
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="h-11 px-8 rounded-xl border border-[#E8D8C4] text-[#2F2925] font-semibold bg-[#FDF0DC] hover:bg-[#F5E8D4] shadow-xs cursor-pointer">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
