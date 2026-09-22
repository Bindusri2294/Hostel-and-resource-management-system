import { Building, ShieldCheck, Utensils, Wifi, Dumbbell, PhoneCall, BookOpen, Clock } from "lucide-react";

export default function HostelInfo() {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-950 text-white p-6 rounded-3xl shadow-xl border border-purple-500/30">
        <h2 className="text-2xl font-black">KIET Residential Hostel Facilities</h2>
        <p className="text-xs text-purple-200 mt-1 max-w-2xl">
          Everything you need to know about facilities, mess timings, safety regulations, and warden contacts.
        </p>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs space-y-2">
          <Utensils className="w-6 h-6 text-purple-600" />
          <h3 className="text-sm font-extrabold text-slate-900">AC Dining Mess</h3>
          <p className="text-xs text-slate-500">Nutritious breakfast, lunch, tea snacks & dinner served daily under hygiene control.</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs space-y-2">
          <Wifi className="w-6 h-6 text-purple-600" />
          <h3 className="text-sm font-extrabold text-slate-900">High-Speed Wi-Fi</h3>
          <p className="text-xs text-slate-500">24/7 internet connectivity across all rooms and study reading halls.</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs space-y-2">
          <ShieldCheck className="w-6 h-6 text-purple-600" />
          <h3 className="text-sm font-extrabold text-slate-900">24x7 Security & CCTV</h3>
          <p className="text-xs text-slate-500">Controlled biometric entry, CCTV surveillance & round-the-clock wardens.</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-purple-100/70 shadow-xs space-y-2">
          <Dumbbell className="w-6 h-6 text-purple-600" />
          <h3 className="text-sm font-extrabold text-slate-900">AC Gym & Sports</h3>
          <p className="text-xs text-slate-500">Equipped gymnasium, indoor games, basketball & cricket grounds.</p>
        </div>
      </div>

      {/* Mess Timings & Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-purple-600" /> Daily Mess Timings
          </h3>
          <div className="space-y-2.5 text-xs font-semibold">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600">Breakfast</span>
              <span className="text-purple-700 font-extrabold">7:30 AM – 9:00 AM</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600">Lunch</span>
              <span className="text-purple-700 font-extrabold">12:30 PM – 2:00 PM</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600">Evening Snacks & Tea</span>
              <span className="text-purple-700 font-extrabold">5:00 PM – 6:00 PM</span>
            </div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-600">Dinner</span>
              <span className="text-purple-700 font-extrabold">7:30 PM – 9:00 PM</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-purple-100/70 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <PhoneCall className="w-4 h-4 text-purple-600" /> Warden & Emergency Contacts
          </h3>
          <div className="space-y-2.5 text-xs font-semibold">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-extrabold text-slate-900">Chief Warden Office</p>
                <p className="text-[11px] text-slate-500">Main Admin Building</p>
              </div>
              <a href="tel:+919849495335" className="text-purple-700 font-bold hover:underline">+91 98494 95335</a>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-extrabold text-slate-900">Hostel Security Helpline</p>
                <p className="text-[11px] text-slate-500">Gate 1 Desk</p>
              </div>
              <a href="tel:+919090887777" className="text-purple-700 font-bold hover:underline">+91 90908 87777</a>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-extrabold text-slate-900">Medical Ambulance 24/7</p>
                <p className="text-[11px] text-slate-500">Campus Dispensary</p>
              </div>
              <a href="tel:08842303400" className="text-purple-700 font-bold hover:underline">0884-2303400</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
