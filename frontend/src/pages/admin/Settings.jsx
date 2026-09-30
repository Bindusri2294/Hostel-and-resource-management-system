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
      <div className="bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#2F2925]">Hostel System Settings</h2>
          <p className="text-xs text-[#8B7355] mt-0.5">
            Configure hostel operational rules, notification triggers, and campus parameters.
          </p>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-[#E8D8C4] shadow-xs space-y-6 text-xs font-semibold">
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-[#2F2925] border-b border-[#E8D8C4] pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#EB8055]" /> General Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#2F2925] mb-1 font-bold">Hostel Campus Name</label>
              <input
                type="text"
                value={form.hostelName}
                onChange={(e) => setForm({ ...form, hostelName: e.target.value })}
                className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
              />
            </div>
            <div>
              <label className="block text-[#2F2925] mb-1 font-bold">Academic Session</label>
              <input
                type="text"
                value={form.academicYear}
                onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-[#2F2925] border-b border-[#E8D8C4] pb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#EB8055]" /> Security & Curfew Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#2F2925] mb-1 font-bold">Hostel Gate Curfew Time</label>
              <input
                type="text"
                value={form.curfewTime}
                onChange={(e) => setForm({ ...form, curfewTime: e.target.value })}
                className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] focus:ring-1 focus:ring-[#EB8055]/20 font-medium text-[#2F2925]"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="guests"
                checked={form.enableGuestVisits}
                onChange={(e) => setForm({ ...form, enableGuestVisits: e.target.checked })}
                className="w-4 h-4 accent-[#EB8055] rounded cursor-pointer"
              />
              <label htmlFor="guests" className="text-[#2F2925] font-bold cursor-pointer">
                Allow Visitor / Parent Day Entry
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E8D8C4] flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
