import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Plus, ShieldCheck, Lock } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const student = user?.student || {};

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Details Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-purple-100/70 p-8">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-8 gap-4">
          <div className="flex items-center gap-6">
            <div 
              className="relative group cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
              title="Upload profile photo"
            >
              <div className="w-20 h-20 rounded-full bg-[#6348f9] text-white font-bold text-2xl shadow-sm border-2 border-white ring-2 ring-gray-100 flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (student?.Name || user?.name || "U").charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white text-purple-700 rounded-full flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform">
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
              <h2 className="text-xl font-bold text-[#1a1d2d]">{student?.Name || user?.name}</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">{student?.Rollno || "Unassigned"}</p>
            </div>
          </div>
          {student?.Status === "Active" && (
            <div className="inline-flex items-center gap-1.5 bg-[#ecfdf3] text-[#027a48] px-3 py-1.5 rounded-full text-xs font-bold border border-[#a6f4c5]">
              <ShieldCheck className="w-4 h-4" />
              Allocated Resident
            </div>
          )}
        </div>

        {/* Form Fields (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#1a1d2d]">Full Name</label>
              <input 
                defaultValue={student?.Name || user?.name} 
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-gray-200 text-gray-500 font-medium focus-visible:outline-none focus-visible:border-[#6348f9] focus-visible:ring-1 focus-visible:ring-[#6348f9]" 
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#1a1d2d]">Email</label>
              <input 
                defaultValue={user?.email} 
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-gray-200 text-gray-500 font-medium focus-visible:outline-none focus-visible:border-[#6348f9] focus-visible:ring-1 focus-visible:ring-[#6348f9]" 
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#1a1d2d]">Roll Number</label>
              <input 
                defaultValue={student?.Rollno || "—"} 
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-gray-200 text-gray-500 font-medium focus-visible:outline-none focus-visible:border-[#6348f9] focus-visible:ring-1 focus-visible:ring-[#6348f9]" 
                readOnly
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#1a1d2d]">Course</label>
              <input 
                defaultValue={student?.Course || "—"} 
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-gray-200 text-gray-500 font-medium focus-visible:outline-none focus-visible:border-[#6348f9] focus-visible:ring-1 focus-visible:ring-[#6348f9]" 
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#1a1d2d]">Academic Year</label>
              <input 
                defaultValue={student?.Year ? `Year ${student.Year}` : "—"} 
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-gray-200 text-gray-500 font-medium focus-visible:outline-none focus-visible:border-[#6348f9] focus-visible:ring-1 focus-visible:ring-[#6348f9]" 
                readOnly
              />
            </div>
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#1a1d2d]">Campus</label>
              <input 
                defaultValue={student?.Campus || "—"} 
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-gray-200 text-gray-500 font-medium focus-visible:outline-none focus-visible:border-[#6348f9] focus-visible:ring-1 focus-visible:ring-[#6348f9]" 
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-purple-100/70 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-50 p-2.5 rounded-full text-orange-500">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-[17px] font-bold text-[#1a1d2d]">Security & Password</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#1a1d2d]">Current Password</label>
            <input 
              type="password" 
              placeholder="Enter current password" 
              className="w-full h-11 px-3 rounded-xl bg-white border border-gray-200 focus-visible:outline-none focus-visible:border-[#6348f9] focus-visible:ring-1 focus-visible:ring-[#6348f9]" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[13px] font-bold text-[#1a1d2d]">New Password</label>
            <input 
              type="password" 
              placeholder="Enter new password" 
              className="w-full h-11 px-3 rounded-xl bg-white border border-gray-200 focus-visible:outline-none focus-visible:border-[#6348f9] focus-visible:ring-1 focus-visible:ring-[#6348f9]" 
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="h-11 px-8 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:text-gray-900 shadow-sm cursor-pointer">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
