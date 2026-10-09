import { Search } from "lucide-react";

export default function AdminSearchBar({ value, onChange, placeholder = "Search student or room..." }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs flex-1 min-w-0">
      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-medium text-slate-800 outline-none w-full"
      />
    </div>
  );
}