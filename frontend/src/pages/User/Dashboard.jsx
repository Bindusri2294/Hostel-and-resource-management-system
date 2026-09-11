import React, { useState, useEffect } from "react";
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
  Building, 
  Layers, 
  Armchair,
  Calendar,
  ChevronRight,
  Sparkles,
  AlertCircle,
  X,
  Wrench,
  Utensils,
  Plus
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function Dashboard() {
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    // Show the reminder initially after 1 second
    const timer = setTimeout(() => setShowReminder(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowReminder(false);
    // Force it to pop back up after 3 seconds to annoy the user into paying
    setTimeout(() => {
      setShowReminder(true);
    }, 3000);
  };

  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  return (
    <div className="flex h-screen bg-[#f4f7f9] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1638] text-white flex flex-col justify-between h-full">
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
            <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-[#ffffff1a] rounded-xl text-white font-medium transition-colors">
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
            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
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
        <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
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
            <Link to="/profile">
              <Avatar className="w-10 h-10 bg-[#6348f9] text-white font-semibold cursor-pointer shadow-sm hover:ring-2 hover:ring-indigo-300 transition-all">
                <AvatarFallback>RK</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            


            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Card 1 */}
              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">My Room</p>
                    <p className="text-3xl font-bold text-[#1a1d2d]">205</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-50/80 rounded-2xl flex items-center justify-center text-indigo-500">
                    <DoorOpen className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Card 2 */}
              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Block</p>
                    <p className="text-3xl font-bold text-[#1a1d2d]">A</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                    <Building className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Card 3 */}
              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Floor</p>
                    <p className="text-3xl font-bold text-[#1a1d2d]">2</p>
                  </div>
                  <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500">
                    <Layers className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>

              {/* Card 4 */}
              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">Room Type</p>
                    <p className="text-3xl font-bold text-[#1a1d2d]">4-Sharing</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                    <Armchair className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Room Details Banner */}
            <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
              <CardContent className="p-8 relative">
                <div className="flex items-center justify-between">
                  <div>
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-[13px] font-medium text-gray-400 mb-5">
                      <span className="hover:text-gray-600 cursor-pointer">Hostel</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span className="hover:text-gray-600 cursor-pointer">Block A</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span className="hover:text-gray-600 cursor-pointer">Floor 2</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-semibold">Room 205</span>
                    </div>

                    <h2 className="text-2xl font-bold text-[#1a1d2d] mb-2 flex items-center gap-2">
                      Room 205 <span className="text-gray-300">•</span> Block A
                    </h2>
                    
                    <p className="text-[14px] text-gray-500 mb-6 font-medium">
                      Allocated 12 Aug 2026 <span className="mx-1.5 font-bold text-gray-300">·</span> 3 of 4 beds occupied
                    </p>

                    <div className="inline-flex items-center gap-1.5 bg-[#ecfdf3] text-[#027a48] px-3 py-1.5 rounded-full text-xs font-bold border border-[#a6f4c5]">
                      <span className="w-1.5 h-1.5 bg-[#12b76a] rounded-full"></span>
                      Active Allocation
                    </div>
                  </div>

                  <Button variant="outline" className="h-11 px-6 rounded-xl border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:text-gray-900 shadow-sm">
                    View Room Details
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Roommates */}
              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl h-full">
                <CardContent className="p-8">
                  <h3 className="text-[17px] font-bold text-[#1a1d2d] mb-6">Roommates</h3>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 bg-indigo-50 text-indigo-600 font-bold text-sm">
                        <AvatarFallback>KS</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-700">Karthik Sharma</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 bg-indigo-50 text-indigo-600 font-bold text-sm">
                        <AvatarFallback>AM</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-700">Aditya Menon</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10 bg-indigo-50 text-indigo-600 font-bold text-sm">
                        <AvatarFallback>FA</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-700">Farhan Ali</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Notices */}
              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl h-full">
                <CardContent className="p-8">
                  <h3 className="text-[17px] font-bold text-[#1a1d2d] mb-6">Recent Notices</h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="mt-0.5">
                        <Wrench className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1a1d2d] text-[15px] mb-1">Water supply maintenance</h4>
                        <p className="text-[13px] text-gray-500 font-medium">Block A, 2 Sep, 9-11 AM</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="mt-0.5">
                        <Utensils className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#1a1d2d] text-[15px] mb-1">Mess menu updated for September</h4>
                        <p className="text-[13px] text-gray-500 font-medium">Applies from 1 Sep</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </main>

      {/* Quick Action FAB */}
      <button className="fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-[#6348f9] hover:bg-[#5236ec] text-white rounded-full shadow-[0_8px_30px_rgb(99,72,249,0.4)] transition-all hover:scale-105 z-40 group">
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Persistent Mess Fee Reminder Toast */}
      {showReminder && (
        <div className="fixed top-6 right-6 w-96 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-5 fade-in duration-300">
          <div className="bg-red-50 p-4 border-b border-red-100 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-red-900">Mess Fee Pending</h3>
            </div>
            <button onClick={handleDismiss} className="text-red-400 hover:text-red-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              This month's mess fee of <span className="font-bold text-gray-900">₹4,500</span> is pending. Please pay by the end of this month to avoid any inconvenience.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={handleDismiss} className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm font-semibold transition-colors">
                Dismiss
              </button>
              <button onClick={() => alert("Redirecting to payment gateway...")} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-red-200">
                Pay Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
