import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  DoorOpen, 
  ClipboardList, 
  Package, 
  MessageSquare, 
  BarChart as BarChartIcon,
  FileText,
  Settings,
  LogOut, 
  Menu, 
  Search, 
  Bell, 
  Home, 
  Calendar,
  Sparkles,
  Download
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const kietData = [
  { name: "Students", "3rd Year": 800, "Final Year": 600 },
  { name: "Occupied", "3rd Year": 150, "Final Year": 120 },
  { name: "Available", "3rd Year": 50, "Final Year": 80 },
  { name: "Allocations", "3rd Year": 750, "Final Year": 550 },
];

const kietWData = [
  { name: "Students", "3rd Year": 400, "Final Year": 300 },
  { name: "Occupied", "3rd Year": 80, "Final Year": 60 },
  { name: "Available", "3rd Year": 20, "Final Year": 40 },
  { name: "Allocations", "3rd Year": 380, "Final Year": 280 },
];

const sectionData = [
  { name: "A Section", students: 120, percentage: 32, color: "#4f46e5" },
  { name: "B Section", students: 102, percentage: 27, color: "#7c3aed" },
  { name: "C Section", students: 90, percentage: 24, color: "#06b6d4" },
  { name: "D Section", students: 66, percentage: 17, color: "#f59e0b" },
];

export default function AdminAnalyticsPage() {
  const [activeCollege, setActiveCollege] = useState("KIET");

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
            <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-[#9ca3af] hover:text-white hover:bg-[#ffffff0d] rounded-xl transition-colors">
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
            <Link to="/admin/analytics" className="flex items-center gap-3 px-4 py-3 bg-[#ffffff1a] rounded-xl text-white font-medium transition-colors">
              <BarChartIcon className="w-5 h-5" /> Analytics
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
              Good morning, Meera
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
            <Avatar className="w-10 h-10 bg-[#6348f9] text-white font-semibold cursor-pointer shadow-sm hover:ring-2 hover:ring-indigo-300 transition-all">
              <AvatarFallback>MN</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            {/* College Analytics Card */}
            <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-[#1a1d2d] mb-1">College Analytics</h3>
                    <p className="text-[14px] text-gray-500 font-medium">Students, occupancy and allocations by college</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button onClick={() => alert("Downloading PDF Report...")} variant="outline" className="h-9 px-4 rounded-lg border-gray-200 text-gray-600 font-semibold text-xs hover:bg-gray-50 flex items-center gap-2">
                      <Download className="w-3.5 h-3.5" /> Export PDF
                    </Button>
                    <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {["KIET", "KIET-W"].map((college) => (
                      <button 
                        key={college}
                        onClick={() => setActiveCollege(college)}
                        className={`px-4 py-1.5 text-sm font-semibold transition-colors ${
                          activeCollege === college 
                            ? "bg-indigo-50 text-indigo-700 border-l border-indigo-200 first:border-l-0" 
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700 border-l border-gray-200 first:border-l-0"
                        }`}
                      >
                        {college}
                      </button>
                    ))}
                    </div>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeCollege === "KIET" ? kietData : kietWData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }}
                        dx={-10}
                      />
                      <RechartsTooltip 
                        cursor={{ fill: '#f9fafb' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                      <Bar dataKey="3rd Year" fill="#6348f9" radius={[4, 4, 0, 0]} maxBarSize={60} />
                      <Bar dataKey="Final Year" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Section-wise Analytics Card */}
            <Card className="border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] rounded-2xl">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-[#1a1d2d] mb-1">Section-wise Analytics</h3>
                <p className="text-[14px] text-gray-500 font-medium mb-8">Current student distribution by section</p>

                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 pl-4 md:pl-12 pb-4">
                  <div className="w-[280px] h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectionData}
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={3}
                          dataKey="students"
                          stroke="none"
                        >
                          {sectionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-col gap-5">
                    {sectionData.map((item) => (
                      <div key={item.name} className="flex items-center gap-6">
                        <div className="flex items-center gap-3 w-32">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                          <span className="font-bold text-[#1a1d2d] text-sm">{item.name}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-500 w-24">
                          {item.students} students
                        </div>
                        <div className="text-sm font-medium text-gray-400">
                          · {item.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
}
