import React, { useState, useEffect } from "react";
import { Send, BellRing, Users, MapPin, BookOpen, Trash2, Loader2, Info, X } from "lucide-react";
import { notificationService, studentService } from "../../services/api";
import { getErrorMessage } from "../../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    title: "",
    message: "",
    targetType: "ALL",
    targetValue: ""
  });
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");

  const blocks = ["D", "E", "KW", "Executive"];
  const courses = ["B.TECH", "DIPLOMA", "PHARMACY", "MBA", "MCA"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notifRes, studentRes] = await Promise.all([
        notificationService.list(),
        studentService.list()
      ]);
      setNotifications(notifRes.data || []);
      setStudents(studentRes.data || []);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, "Failed to load notifications."));
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await notificationService.create(form);
      setSuccess("Notification sent successfully!");
      setForm({ ...form, title: "", message: "", targetValue: form.targetType === "ALL" ? "" : form.targetValue });
      fetchData(); // Refresh list
    } catch (err) {
      setError(getErrorMessage(err, "Failed to send notification."));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await notificationService.remove(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      alert(getErrorMessage(err, "Failed to delete notification."));
    }
  };

  // Icon for target type
  const getTargetIcon = (type) => {
    switch (type) {
      case "ALL": return <Users className="w-4 h-4" />;
      case "BLOCK": return <MapPin className="w-4 h-4" />;
      case "COURSE": return <BookOpen className="w-4 h-4" />;
      case "SINGLE_STUDENT": return <Info className="w-4 h-4" />;
      default: return <BellRing className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 -mt-2 md:-mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2F2925] tracking-tight">Announcements</h1>
          <p className="text-sm font-semibold text-[#8B7355] mt-1">
            Send targeted alerts and notifications to students.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-bold shadow-sm flex items-center justify-between gap-2">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="p-1 hover:bg-rose-100 rounded-lg text-rose-700 transition-colors cursor-pointer"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl text-sm font-bold shadow-sm flex items-center justify-between gap-2">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CREATE NOTIFICATION FORM */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-xs border border-[#E8D8C4] overflow-hidden">
            <div className="bg-[#FDF0DC] p-4 border-b border-[#E8D8C4] flex items-center gap-3">
              <div className="p-2 bg-[#EB8055] text-white rounded-xl shadow-xs">
                <Send className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-[#2F2925]">Send New Alert</h2>
            </div>
            
            <form onSubmit={handleSend} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#2F2925] uppercase tracking-wide mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Important Maintenance Update"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#FEF7EE] border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055] font-semibold text-sm text-[#2F2925]"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2F2925] uppercase tracking-wide mb-1">Message</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Type your announcement here..."
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-[#FEF7EE] border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055] font-semibold text-sm text-[#2F2925] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#2F2925] uppercase tracking-wide mb-1">Send To</label>
                <select
                  value={form.targetType}
                  onChange={e => {
                    setForm({ ...form, targetType: e.target.value, targetValue: "" });
                  }}
                  className="w-full bg-[#FEF7EE] border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055] font-bold text-sm text-[#2F2925]"
                >
                  <option value="ALL">All Students</option>
                  <option value="BLOCK">Specific Block</option>
                  <option value="COURSE">Specific Course</option>
                  <option value="SINGLE_STUDENT">Specific Student</option>
                </select>
              </div>

              {/* Dynamic Second Input based on TargetType */}
              {form.targetType === "BLOCK" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-extrabold text-[#2F2925] uppercase tracking-wide mb-1">Select Block</label>
                  <select
                    required
                    value={form.targetValue}
                    onChange={e => setForm({ ...form, targetValue: e.target.value })}
                    className="w-full bg-[#FEF7EE] border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055] font-bold text-sm text-[#EB8055]"
                  >
                    <option value="" disabled>Choose a block...</option>
                    {blocks.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              )}

              {form.targetType === "COURSE" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-extrabold text-[#2F2925] uppercase tracking-wide mb-1">Select Course</label>
                  <select
                    required
                    value={form.targetValue}
                    onChange={e => setForm({ ...form, targetValue: e.target.value })}
                    className="w-full bg-[#FEF7EE] border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055] font-bold text-sm text-[#EB8055]"
                  >
                    <option value="" disabled>Choose a course...</option>
                    {courses.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}

              {form.targetType === "SINGLE_STUDENT" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-extrabold text-[#2F2925] uppercase tracking-wide mb-1">Search & Select Student</label>
                  <input
                    list="student-list"
                    required
                    placeholder="Type name or roll no..."
                    value={form.targetValue}
                    onChange={e => setForm({ ...form, targetValue: e.target.value })}
                    className="w-full bg-[#FEF7EE] border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055] font-bold text-sm text-[#EB8055]"
                  />
                  <datalist id="student-list">
                    {students.map(s => (
                      <option key={s._id} value={s.Rollno}>
                        {s.Name} ({s.Rollno})
                      </option>
                    ))}
                  </datalist>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full mt-2 py-3 rounded-xl font-extrabold text-sm text-white bg-[#EB8055] hover:bg-[#D96B3A] transition-colors shadow-md shadow-[#EB8055]/20 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                {busy ? "Sending..." : "Send Announcement"}
              </button>
            </form>
          </div>
        </div>

        {/* NOTIFICATION HISTORY */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-xs border border-[#E8D8C4] overflow-hidden h-full flex flex-col max-h-[600px]">
            <div className="p-4 border-b border-[#E8D8C4] flex items-center gap-2 bg-[#FDF0DC]">
              <BellRing className="w-5 h-5 text-[#EB8055]" />
              <h2 className="text-sm font-extrabold text-[#2F2925] uppercase tracking-wider">Broadcast History</h2>
            </div>
            
            <div className="p-0 overflow-y-auto flex-1 bg-white">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#EB8055]" />
                  <p className="text-sm font-bold text-[#8B7355]">Loading history...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-[#E8D8C4]/60">
                  {notifications.map((notif) => (
                    <div key={notif._id} className="p-4 hover:bg-[#FDF0DC]/40 transition-colors group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-[#2F2925] text-sm">{notif.title}</h3>
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FDF0DC] text-[#8B7355] border border-[#E8D8C4] flex items-center gap-1">
                              {getTargetIcon(notif.targetType)}
                              {notif.targetType === "ALL" ? "Everyone" : `${notif.targetType}: ${notif.targetValue}`}
                            </span>
                          </div>
                          <p className="text-xs text-[#5A4A3A] font-medium whitespace-pre-wrap">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-[#8B7355] font-bold mt-2">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(notif._id)}
                          className="p-1.5 text-[#8B7355] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete Notification"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-[#FDF0DC] flex items-center justify-center mx-auto mb-3">
                    <BellRing className="w-8 h-8 text-[#8B7355]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#2F2925]">No broadcasts sent</h3>
                  <p className="text-xs text-[#8B7355] font-medium">Alerts you send will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
