import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Building2, 
  DoorOpen, 
  Package, 
  MessageSquare, 
  User, 
  LogOut, 
  Menu, 
  Search, 
  Bell, 
  Home, 
  Calendar,
  Sparkles,
  ShieldCheck,
  Camera,
  Lock
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function Profile() {
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  return (
    <div className="flex h-screen bg-[#f4f7f9] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1638] text-white flex flex-col justify-between h-full shrink-0">
        <div>
          {/* Logo Section */}
          <div className="p-6 flex items-center gap-3 cursor-pointer">
            <div className="bg-[#6348f9] p-2 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide">HostelEase</span>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1 mt-2">
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </Link>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <ClipboardList className="w-5 h-5" /> My Allocation
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <Building2 className="w-5 h-5" /> Hostel Info
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <DoorOpen className="w-5 h-5" /> Rooms
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <Package className="w-5 h-5" /> Resources
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <MessageSquare className="w-5 h-5" /> Feedback
            </a>
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 bg-[#ffffff1a] rounded-xl text-white font-medium transition-colors">
              <User className="w-5 h-5" /> Profile
            </Link>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 space-y-1 mb-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-indigo-400 hover:text-indigo-300 hover:bg-[#ffffff0d] rounded-xl transition-colors font-bold">
            <Sparkles className="w-5 h-5" /> Switch to Admin
          </Link>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
            <LogOut className="w-5 h-5" /> Sign out
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100 shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1d2d] flex items-center gap-2">
              Welcome back, Rahul <span className="text-2xl">👋</span>
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1 font-medium">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative w-[320px]">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search..." 
                className="pl-11 bg-gray-50/80 border-transparent shadow-none rounded-xl h-11 focus-visible:ring-1 focus-visible:ring-gray-200" 
              />
            </div>
            <button className="relative text-gray-500 hover:text-gray-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <Avatar className="w-10 h-10 bg-[#6348f9] text-white font-semibold cursor-pointer shadow-sm">
              <AvatarFallback>RK</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
              <CardContent className="p-8">
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <Avatar className="w-20 h-20 bg-[#6348f9] text-white font-bold text-2xl shadow-sm border-2 border-white ring-2 ring-gray-100">
                        {profileImage ? (
                          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <AvatarFallback>RK</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
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
                      <h2 className="text-xl font-bold text-[#1a1d2d]">Rahul Kumar</h2>
                      <p className="text-sm font-medium text-gray-500 mt-1">21AI037</p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-[#ecfdf3] text-[#027a48] px-3 py-1.5 rounded-full text-xs font-bold border border-[#a6f4c5]">
                    <ShieldCheck className="w-4 h-4" />
                    Allocated — Room 205, Block A
                  </div>
                </div>

                {/* Form Fields (2 Columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#1a1d2d]">Full Name</label>
                      <Input defaultValue="Rahul Kumar" className="h-11 rounded-xl bg-white border-gray-200 text-gray-500 font-medium focus-visible:ring-[#6348f9]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#1a1d2d]">Email</label>
                      <Input defaultValue="rahul.kumar@campus.edu" className="h-11 rounded-xl bg-white border-gray-200 text-gray-500 font-medium focus-visible:ring-[#6348f9]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#1a1d2d]">Phone Number</label>
                      <Input defaultValue="+91 98765 43210" className="h-11 rounded-xl bg-white border-gray-200 text-gray-500 font-medium focus-visible:ring-[#6348f9]" />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#1a1d2d]">Department</label>
                      <Input defaultValue="AI & DS" className="h-11 rounded-xl bg-white border-gray-200 text-gray-500 font-medium focus-visible:ring-[#6348f9]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#1a1d2d]">Guardian Name</label>
                      <Input defaultValue="Suresh Kumar" className="h-11 rounded-xl bg-white border-gray-200 text-gray-500 font-medium focus-visible:ring-[#6348f9]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#1a1d2d]">Guardian Phone</label>
                      <Input defaultValue="+91 91234 56789" className="h-11 rounded-xl bg-white border-gray-200 text-gray-500 font-medium focus-visible:ring-[#6348f9]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-bold text-[#1a1d2d]">Home Address</label>
                      <Input defaultValue="123 Example Street, Hyderabad" className="h-11 rounded-xl bg-white border-gray-200 text-gray-500 font-medium focus-visible:ring-[#6348f9]" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                  <Button className="h-11 px-8 rounded-xl bg-[#6348f9] hover:bg-[#5236eb] text-white font-semibold text-[15px] shadow-sm transition-colors">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Change Password Section */}
            <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-orange-50 p-2.5 rounded-full text-orange-500">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h3 className="text-[17px] font-bold text-[#1a1d2d]">Security & Password</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-[#1a1d2d]">Current Password</label>
                    <Input type="password" placeholder="Enter current password" className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-[#6348f9]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-[#1a1d2d]">New Password</label>
                    <Input type="password" placeholder="Enter new password" className="h-11 rounded-xl bg-white border-gray-200 focus-visible:ring-[#6348f9]" />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="outline" className="h-11 px-8 rounded-xl border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:text-gray-900 shadow-sm">
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
