import { useState } from "react";
import { Settings as SettingsIcon, Save, Shield, Bell, Lock, Building } from "lucide-react";

export default function Settings() {
  const [form, setForm] = useState({
    hostelName: "KIET Group Hostels",
    academicYear: "2026-2027",
    curfewTime: "10:00 PM",
    enableGuestVisits: true,
    emailAlerts: true,
  });
  const [msg, setMsg] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setMsg("System settings saved successfully.");
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Configuration
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-2">Hostel System Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure hostel operational rules, notification triggers, and campus parameters.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-6 text-xs font-semibold">
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-600" /> General Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Hostel Campus Name</label>
              <input
                type="text"
                value={form.hostelName}
                onChange={(e) => setForm({ ...form, hostelName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Academic Session</label>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-600" /> Security & Curfew Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Hostel Gate Curfew Time</label>
              <input
                type="text"
                value={form.curfewTime}
                onChange={(e) => setForm({ ...form, curfewTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-purple-600 font-medium"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="guests"
                checked={form.enableGuestVisits}
                onChange={(e) => setForm({ ...form, enableGuestVisits: e.target.checked })}
                className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
              />
              <label htmlFor="guests" className="text-slate-800 font-bold cursor-pointer">
                Allow Visitor / Parent Day Entry
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
