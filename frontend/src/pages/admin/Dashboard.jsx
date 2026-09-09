import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  DoorOpen, 
  ClipboardList, 
  Package, 
  MessageSquare, 
  BarChart,
  FileText,
  Settings,
  LogOut, 
  Menu, 
  Search, 
  Bell, 
  Home, 
  Calendar,
  TrendingUp,
  CheckCircle2,
  Circle,
  Star,
  UserPlus,
  ClipboardPlus,
  PackagePlus,
  Sparkles,
  X
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const occupancyData = [
  { name: "Occupied", value: 198, color: "#6348f9" },
  { name: "Available", value: 58, color: "#eef2f6" },
];

export default function AdminDashboard() {
  const [showAddStudent, setShowAddStudent] = useState(false);

  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);

  return (
    <div className="flex h-screen bg-[#f4f7f9] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1a1638] text-white flex flex-col justify-between h-full shrink-0">
        <div className="overflow-y-auto">
          {/* Logo Section */}
          <div className="p-6 flex items-center gap-3 cursor-pointer">
            <div className="bg-[#6348f9] p-2 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wide">HostelEase</span>
          </div>

          {/* Navigation Links */}
          <nav className="px-4 space-y-1 mt-2">
            <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-[#ffffff1a] rounded-xl text-white font-medium transition-colors">
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </Link>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <Users className="w-5 h-5" /> Students
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <DoorOpen className="w-5 h-5" /> Rooms
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <ClipboardList className="w-5 h-5" /> Allocations
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <Package className="w-5 h-5" /> Resources
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <MessageSquare className="w-5 h-5" /> Feedback
            </a>
            <Link to="/admin/analytics" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <BarChart className="w-5 h-5" /> Analytics
            </Link>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <FileText className="w-5 h-5" /> Reports
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
              <Settings className="w-5 h-5" /> Settings
            </a>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 space-y-1 mt-auto shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-emerald-400 hover:text-emerald-300 hover:bg-[#ffffff0d] rounded-xl transition-colors font-bold">
            <Sparkles className="w-5 h-5" /> Switch to User
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
              Good afternoon, Meera
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
              <AvatarFallback>MN</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {/* 6 Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="p-5 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[13px] font-semibold text-gray-500">Total Students</p>
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1d2d] mb-2">1,248</h3>
                  <p className="text-xs font-semibold text-[#12b76a] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +12 this month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[13px] font-semibold text-gray-500">Total Rooms</p>
                    <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-500">
                      <DoorOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1d2d] mb-2">256</h3>
                  <p className="text-xs font-semibold text-[#12b76a] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +2 this month
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[13px] font-semibold text-gray-500">Occupied Rooms</p>
                    <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1d2d] mb-2">198</h3>
                  <p className="text-xs font-semibold text-[#12b76a] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> 77.3% occupied
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[13px] font-semibold text-gray-500">Available Rooms</p>
                    <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-500">
                      <Circle className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1d2d] mb-2">58</h3>
                  <p className="text-xs text-transparent select-none">Spacer</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[13px] font-semibold text-gray-500">Total Resources</p>
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1d2d] mb-2">48</h3>
                  <p className="text-xs text-transparent select-none">Spacer</p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[13px] font-semibold text-gray-500">Feedback</p>
                    <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center text-pink-500">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-[#1a1d2d] mb-2">86</h3>
                  <p className="text-xs text-transparent select-none">Spacer</p>
                </CardContent>
              </Card>
            </div>

            {/* Middle Section: Overview & Feedback */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Occupancy Overview Chart */}
              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
                <CardContent className="p-8 flex flex-col items-center">
                  <h3 className="text-xl font-bold text-[#1a1d2d] mb-1 text-center">Occupancy Overview</h3>
                  <p className="text-sm text-gray-500 mb-8 text-center">Live room utilisation</p>
                  
                  <div className="relative w-64 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={occupancyData}
                          innerRadius={90}
                          outerRadius={110}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={4}
                        >
                          {occupancyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-extrabold text-[#1a1d2d]">77.3%</span>
                      <span className="text-sm font-medium text-gray-500 mt-1">Occupied</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-6 text-sm font-medium text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#6348f9]"></span> Occupied <span className="font-semibold text-gray-900 ml-1">198</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#eef2f6]"></span> Available <span className="font-semibold text-gray-900 ml-1">58</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Feedback */}
              <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl flex flex-col">
                <CardContent className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-[#1a1d2d]">Recent Feedback</h3>
                    <Button variant="outline" className="h-9 rounded-lg text-xs font-semibold px-4 border-gray-200">
                      View All
                    </Button>
                  </div>

                  <div className="space-y-6 flex-1">
                    <div className="flex gap-4">
                      <Avatar className="w-10 h-10 bg-indigo-50 text-indigo-600 font-bold text-xs mt-1">
                        <AvatarFallback>RK</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-[#1a1d2d]">Rahul Kumar</h4>
                            <p className="text-[13px] text-gray-500 mt-1">"Room facilities are good, roommates are great too."</p>
                            <p className="text-xs text-gray-400 mt-1.5 font-medium">25 Aug 2026</p>
                          </div>
                          <div className="flex text-yellow-400">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    <div className="flex gap-4">
                      <Avatar className="w-10 h-10 bg-indigo-50 text-indigo-600 font-bold text-xs mt-1">
                        <AvatarFallback>AR</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-[#1a1d2d]">Ananya Rao</h4>
                            <p className="text-[13px] text-gray-500 mt-1">"WiFi drops frequently in the evenings on floor 2."</p>
                            <p className="text-xs text-gray-400 mt-1.5 font-medium">24 Aug 2026</p>
                          </div>
                          <div className="flex text-yellow-400">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 text-gray-200" />
                            <Star className="w-3.5 h-3.5 text-gray-200" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    <div className="flex gap-4">
                      <Avatar className="w-10 h-10 bg-indigo-50 text-indigo-600 font-bold text-xs mt-1">
                        <AvatarFallback>SP</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-[#1a1d2d]">Sneha Patel</h4>
                            <p className="text-[13px] text-gray-500 mt-1">"Housekeeping has improved a lot this month."</p>
                            <p className="text-xs text-gray-400 mt-1.5 font-medium">22 Aug 2026</p>
                          </div>
                          <div className="flex text-yellow-400">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <Star className="w-3.5 h-3.5 text-gray-200" />
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Allocations Table */}
            <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#1a1d2d]">Recent Allocations</h3>
                  <Button variant="outline" className="h-9 rounded-lg text-xs font-semibold px-4 border-gray-200">
                    View All
                  </Button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-500 font-bold">
                        <th className="pb-4 pr-6">Student</th>
                        <th className="pb-4 px-6">Roll Number</th>
                        <th className="pb-4 px-6">Room</th>
                        <th className="pb-4 px-6">Block</th>
                        <th className="pb-4 px-6">Allocated Date</th>
                        <th className="pb-4 pl-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium text-[#1a1d2d]">
                      <tr className="border-b border-gray-50">
                        <td className="py-4 pr-6">Rahul Kumar</td>
                        <td className="py-4 px-6 text-gray-500">21AI037</td>
                        <td className="py-4 px-6">Room 205</td>
                        <td className="py-4 px-6">Block A</td>
                        <td className="py-4 px-6 text-gray-500">12 Aug 2026</td>
                        <td className="py-4 pl-6 text-right">
                          <span className="inline-flex items-center gap-1.5 bg-[#ecfdf3] text-[#027a48] px-2.5 py-1 rounded-full text-xs font-bold border border-[#a6f4c5]">
                            <span className="w-1.5 h-1.5 bg-[#12b76a] rounded-full"></span>
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50">
                        <td className="py-4 pr-6">Priya Sharma</td>
                        <td className="py-4 px-6 text-gray-500">21CS014</td>
                        <td className="py-4 px-6">Room 205</td>
                        <td className="py-4 px-6">Block A</td>
                        <td className="py-4 px-6 text-gray-500">12 Aug 2026</td>
                        <td className="py-4 pl-6 text-right">
                          <span className="inline-flex items-center gap-1.5 bg-[#ecfdf3] text-[#027a48] px-2.5 py-1 rounded-full text-xs font-bold border border-[#a6f4c5]">
                            <span className="w-1.5 h-1.5 bg-[#12b76a] rounded-full"></span>
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50">
                        <td className="py-4 pr-6">Arjun Reddy</td>
                        <td className="py-4 px-6 text-gray-500">22EC021</td>
                        <td className="py-4 px-6">Room 112</td>
                        <td className="py-4 px-6">Block B</td>
                        <td className="py-4 px-6 text-gray-500">03 Jul 2026</td>
                        <td className="py-4 pl-6 text-right">
                          <span className="inline-flex items-center gap-1.5 bg-[#ecfdf3] text-[#027a48] px-2.5 py-1 rounded-full text-xs font-bold border border-[#a6f4c5]">
                            <span className="w-1.5 h-1.5 bg-[#12b76a] rounded-full"></span>
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b border-gray-50">
                        <td className="py-4 pr-6">Sneha Patel</td>
                        <td className="py-4 px-6 text-gray-500">21IT045</td>
                        <td className="py-4 px-6">Room 301</td>
                        <td className="py-4 px-6">Block C</td>
                        <td className="py-4 px-6 text-gray-500">19 Jun 2026</td>
                        <td className="py-4 pl-6 text-right">
                          <span className="inline-flex items-center gap-1.5 bg-[#ecfdf3] text-[#027a48] px-2.5 py-1 rounded-full text-xs font-bold border border-[#a6f4c5]">
                            <span className="w-1.5 h-1.5 bg-[#12b76a] rounded-full"></span>
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-4 pr-6">Karthik Iyer</td>
                        <td className="py-4 px-6 text-gray-500">23AI002</td>
                        <td className="py-4 px-6">Room 102</td>
                        <td className="py-4 px-6">Block A</td>
                        <td className="py-4 px-6 text-gray-500">27 Aug 2026</td>
                        <td className="py-4 pl-6 text-right">
                          <span className="inline-flex items-center gap-1.5 bg-[#fff7eb] text-[#b54708] px-2.5 py-1 rounded-full text-xs font-bold border border-[#fedf89]">
                            <span className="w-1.5 h-1.5 bg-[#f79009] rounded-full"></span>
                            Pending
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="pb-8">
              <h3 className="text-[17px] font-bold text-[#1a1d2d] mb-4">Quick Actions</h3>
              <div className="flex gap-4 flex-wrap">
                <Button onClick={() => setShowAddStudent(true)} variant="outline" className="h-24 w-32 flex flex-col items-center justify-center gap-2 rounded-2xl border-gray-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-700 transition-all shadow-sm">
                  <UserPlus className="w-6 h-6 text-indigo-500" />
                  <span className="text-xs font-semibold">Add Student</span>
                </Button>
                <Button variant="outline" className="h-24 w-32 flex flex-col items-center justify-center gap-2 rounded-2xl border-gray-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-700 transition-all shadow-sm">
                  <DoorOpen className="w-6 h-6 text-indigo-500" />
                  <span className="text-xs font-semibold">Add Room</span>
                </Button>
                <Button variant="outline" className="h-24 w-32 flex flex-col items-center justify-center gap-2 rounded-2xl border-gray-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-700 transition-all shadow-sm">
                  <ClipboardPlus className="w-6 h-6 text-indigo-500" />
                  <span className="text-xs font-semibold">New Allocation</span>
                </Button>
                <Button variant="outline" className="h-24 w-32 flex flex-col items-center justify-center gap-2 rounded-2xl border-gray-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-700 transition-all shadow-sm">
                  <PackagePlus className="w-6 h-6 text-indigo-500" />
                  <span className="text-xs font-semibold">Add Resource</span>
                </Button>
                <Button variant="outline" className="h-24 w-32 flex flex-col items-center justify-center gap-2 rounded-2xl border-gray-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-200 hover:text-indigo-700 transition-all shadow-sm">
                  <FileText className="w-6 h-6 text-indigo-500" />
                  <span className="text-xs font-semibold">View Reports</span>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1a1d2d]">Add New Student</h2>
              <button onClick={() => setShowAddStudent(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1a1d2d]">Full Name</label>
                <Input placeholder="Enter student's full name" className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white focus-visible:ring-[#6348f9]" />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#1a1d2d]">Roll Number</label>
                <Input placeholder="e.g. 24AI001" className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white focus-visible:ring-[#6348f9]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#1a1d2d]">Department</label>
                  <Input placeholder="e.g. AI & DS" className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white focus-visible:ring-[#6348f9]" />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[#1a1d2d]">Year</label>
                  <Input placeholder="e.g. 1st Year" className="h-11 rounded-xl bg-gray-50 border-transparent focus-visible:bg-white focus-visible:ring-[#6348f9]" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <Button onClick={() => setShowAddStudent(false)} variant="outline" className="h-11 rounded-xl border-gray-200 text-gray-600 font-semibold hover:bg-gray-100">
                Cancel
              </Button>
              <Button onClick={() => setShowAddStudent(false)} className="h-11 rounded-xl bg-[#6348f9] hover:bg-[#5236eb] text-white font-semibold">
                Add Student
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
