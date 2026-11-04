import { useEffect, useState } from "react";
import { feeService, getErrorMessage } from "../../services/api";
import {
  Receipt,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  X,
  CreditCard,
  History,
  Eye,
  Building,
  User,
  DollarSign,
} from "lucide-react";

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({
    totalRecords: 0,
    totalBilled: 0,
    totalCollected: 0,
    totalPending: 0,
    paidCount: 0,
    overdueCount: 0,
    partialCount: 0,
    unpaidCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  // Read-only Details Modal
  const [selectedFee, setSelectedFee] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState("BREAKDOWN"); // "BREAKDOWN" | "PAYMENTS" | "REVISIONS"

  // Fetch fees (read-only)
  const fetchFees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await feeService.list({
        status: statusFilter !== "All" ? statusFilter : undefined,
        feeType: typeFilter !== "All" ? typeFilter : undefined,
        academicYear: yearFilter !== "All" ? yearFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setFees(res.data?.fees || []);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load fee records."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [statusFilter, typeFilter, yearFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFees();
  };

  const openDetailsModal = (fee, defaultTab = "BREAKDOWN") => {
    setSelectedFee(fee);
    setDetailsTab(defaultTab);
    setIsDetailsModalOpen(true);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (fees.length === 0) return;

    const headers = [
      "Roll No",
      "Block",
      "Room No",
      "Fee Type",
      "Academic Year",
      "Term",
      "Total Amount",
      "Paid Amount",
      "Balance",
      "Due Date",
      "Status",
      "Remarks",
    ];

    const rows = fees.map((f) => {
      const balance = Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0));
      const dueStr = f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-IN") : "";
      const block = f.student?.Block || "-";
      const room = f.student?.Roomno || "-";
      return [
        f.studentRollno,
        block,
        room,
        f.feeType,
        f.academicYear,
        f.term || "Full Year",
        f.totalAmount,
        f.paidAmount,
        balance,
        dueStr,
        f.status,
        `"${(f.remarks || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hostel_Fees_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status badge helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Paid
          </span>
        );
      case "Partially Paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Partially Paid
          </span>
        );
      case "Overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDF0DC] text-[#B85228] border border-[#E8D8C4]">
            <Clock className="w-3 h-3 text-[#B85228]" />
            Unpaid
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-[#E8D8C4]">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2925] tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-[#EB8055]" />
            Hostel Fee Management
          </h1>
          <p className="text-xs text-[#8B7355] mt-1">
            View student fee accounts, track collection statuses, and monitor outstanding balances.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-nowrap">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={fees.length === 0}
            className="px-3.5 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#EB8055]" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={fetchFees}
            className="p-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
            title="Refresh Fee Data"
          >
            <RefreshCw className={`w-4 h-4 text-[#8B7355] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#E8D8C4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Total Billed</span>
            <div className="w-7 h-7 rounded-lg bg-[#FDF0DC] flex items-center justify-center text-[#EB8055]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#2F2925] mt-2">
            ₹{Number(stats.totalBilled || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white border border-[#E8D8C4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Total Collected</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-700 mt-2">
            ₹{Number(stats.totalCollected || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white border border-[#E8D8C4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Total Pending</span>
            <div className="w-7 h-7 rounded-lg bg-[#FDF0DC] flex items-center justify-center text-[#B85228]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#B85228] mt-2">
            ₹{Number(stats.totalPending || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-white border border-[#E8D8C4] rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Overdue Invoices</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-rose-700 mt-2">{stats.overdueCount || 0}</p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-[#E8D8C4] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B7355]" />
            <input
              type="text"
              placeholder="Search by student roll no or remarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl text-xs font-semibold text-[#2F2925] placeholder:text-[#8B7355] focus:outline-none focus:border-[#EB8055] transition-all"
            />
          </form>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl text-xs font-bold text-[#2F2925] focus:outline-none focus:border-[#EB8055] cursor-pointer"
            >
              <option value="All">All Fee Types</option>
              <option value="Hostel Fee">Hostel Fee</option>
              <option value="Mess Fee">Mess Fee</option>
              <option value="Maintenance Fee">Maintenance Fee</option>
              <option value="Caution Deposit">Caution Deposit</option>
              <option value="Electricity / Utility">Electricity / Utility</option>
              <option value="Other">Other</option>
            </select>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl text-xs font-bold text-[#2F2925] focus:outline-none focus:border-[#EB8055] cursor-pointer"
            >
              <option value="All">All Academic Years</option>
              <option value="2025-2026">2025-2026</option>
              <option value="2024-2025">2024-2025</option>
              <option value="2026-2027">2026-2027</option>
            </select>

            {(searchQuery || statusFilter !== "All" || typeFilter !== "All" || yearFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("All");
                  setTypeFilter("All");
                  setYearFilter("All");
                }}
                className="px-3 py-2 text-xs font-bold text-[#8B7355] hover:text-[#2F2925] cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E8D8C4]/60 text-xs font-bold">
          <span className="text-[#8B7355] mr-1 text-[11px]">Status:</span>
          {["All", "Unpaid", "Partially Paid", "Paid", "Overdue"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-[#EB8055] text-white font-extrabold shadow-xs"
                  : "bg-[#FDF0DC]/50 text-[#8B7355] hover:text-[#2F2925]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* READ-ONLY FEE RECORDS TABLE */}
      <div className="bg-white border border-[#E8D8C4] rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-[#8B7355] font-semibold flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#EB8055] border-t-transparent rounded-full animate-spin" />
            <span>Loading fee records...</span>
          </div>
        ) : fees.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Receipt className="w-10 h-10 text-[#8B7355]/40 mx-auto" />
            <h3 className="text-sm font-bold text-[#2F2925]">No fee invoices found</h3>
            <p className="text-xs text-[#8B7355]">
              {searchQuery || statusFilter !== "All"
                ? "Try adjusting your search criteria or filters."
                : "No fee statements are currently available in the database."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FDF0DC]/40 border-b border-[#E8D8C4] text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">
                  <th className="py-3 px-4">Student Roll No</th>
                  <th className="py-3 px-4">Fee Type & Term</th>
                  <th className="py-3 px-4 text-right">Total (₹)</th>
                  <th className="py-3 px-4 text-right">Paid (₹)</th>
                  <th className="py-3 px-4 text-right">Balance (₹)</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D8C4]/60">
                {fees.map((fee) => {
                  const balance = Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0));
                  const block = fee.student?.Block;
                  const room = fee.student?.Roomno;

                  return (
                    <tr key={fee._id} className="hover:bg-[#FDF0DC]/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#2F2925]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#FDF0DC] text-[#EB8055] font-extrabold flex items-center justify-center text-xs uppercase">
                            {fee.studentRollno.slice(-2) || "ST"}
                          </div>
                          <div>
                            <span className="font-extrabold tracking-wide">{fee.studentRollno}</span>
                            {(block || room) && (
                              <div className="text-[10px] text-[#8B7355] font-semibold flex items-center gap-1">
                                <span>Blk {block || "—"}</span> • <span>Rm {room || "—"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#2F2925] font-semibold">
                        <div className="font-bold flex items-center gap-1.5 flex-wrap">
                          <span>{fee.feeType}</span>
                          {(fee.isEdited || (fee.editHistory && fee.editHistory.length > 0)) && (
                            <button
                              type="button"
                              onClick={() => openDetailsModal(fee, "REVISIONS")}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer transition-colors shadow-2xs"
                              title="Click to view revision audit trail"
                            >
                              <History className="w-2.5 h-2.5 text-amber-600" />
                              <span>Revised ({fee.editHistory?.length || 1}x)</span>
                            </button>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8B7355]">
                          {fee.academicYear} • {fee.term || "Full Year"}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-[#2F2925]">
                        ₹{Number(fee.totalAmount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                        ₹{Number(fee.paidAmount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-[#B85228]">
                        ₹{balance.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 text-[#5A4A3A] font-medium whitespace-nowrap">
                        {fee.dueDate ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#8B7355]" />
                            <span>
                              {new Date(fee.dueDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {renderStatusBadge(fee.status)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openDetailsModal(fee, "BREAKDOWN")}
                          className="px-2.5 py-1.5 bg-[#FDF0DC]/60 hover:bg-[#FDF0DC] border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="View account breakdown"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#EB8055]" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* READ-ONLY STATEMENT DETAILS & AUDIT MODAL */}
      {isDetailsModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#E8D8C4] max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8D8C4] px-6 py-4 bg-[#FDF0DC]/40">
              <div>
                <h3 className="text-base font-extrabold text-[#2F2925] flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#EB8055]" />
                  Fee Statement Details
                </h3>
                <p className="text-[11px] text-[#8B7355] mt-0.5">
                  Roll No: <span className="font-bold text-[#2F2925]">{selectedFee.studentRollno}</span> •{" "}
                  {selectedFee.feeType} ({selectedFee.academicYear})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-6 pt-3 bg-white border-b border-[#E8D8C4]">
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#FDF0DC]/50 border border-[#E8D8C4] rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDetailsTab("BREAKDOWN")}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    detailsTab === "BREAKDOWN"
                      ? "bg-white text-[#2F2925] shadow-xs"
                      : "text-[#8B7355] hover:text-[#2F2925]"
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5 text-[#EB8055]" />
                  <span>Overview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDetailsTab("PAYMENTS")}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    detailsTab === "PAYMENTS"
                      ? "bg-white text-[#2F2925] shadow-xs"
                      : "text-[#8B7355] hover:text-[#2F2925]"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#EB8055]" />
                  <span>Payments ({selectedFee.payments?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDetailsTab("REVISIONS")}
                  className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    detailsTab === "REVISIONS"
                      ? "bg-white text-[#2F2925] shadow-xs"
                      : "text-[#8B7355] hover:text-[#2F2925]"
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-[#EB8055]" />
                  <span>Revisions ({selectedFee.editHistory?.length || 0})</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              {/* TAB 1: OVERVIEW & BREAKDOWN */}
              {detailsTab === "BREAKDOWN" && (
                <div className="space-y-3">
                  <div className="p-4 bg-[#FDF0DC]/40 border border-[#E8D8C4] rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#E8D8C4] pb-2">
                      <span className="font-bold text-[#2F2925]">Account Breakdown</span>
                      {renderStatusBadge(selectedFee.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#8B7355] block">Student Roll No:</span>
                        <strong className="text-[#2F2925] font-mono">{selectedFee.studentRollno}</strong>
                      </div>
                      <div>
                        <span className="text-[#8B7355] block">Term:</span>
                        <strong className="text-[#2F2925]">{selectedFee.term || "Full Year"}</strong>
                      </div>
                      <div>
                        <span className="text-[#8B7355] block">Academic Year:</span>
                        <strong className="text-[#2F2925]">{selectedFee.academicYear}</strong>
                      </div>
                      <div>
                        <span className="text-[#8B7355] block">Due Date:</span>
                        <strong className="text-[#2F2925]">
                          {selectedFee.dueDate
                            ? new Date(selectedFee.dueDate).toLocaleDateString("en-IN")
                            : "—"}
                        </strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E8D8C4] grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-white rounded-xl border border-[#E8D8C4]">
                        <span className="text-[10px] text-[#8B7355] font-bold block">BILLED</span>
                        <p className="font-extrabold text-[#2F2925] mt-0.5">
                          ₹{Number(selectedFee.totalAmount).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-[#E8D8C4]">
                        <span className="text-[10px] text-[#8B7355] font-bold block">COLLECTED</span>
                        <p className="font-extrabold text-emerald-700 mt-0.5">
                          ₹{Number(selectedFee.paidAmount || 0).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-[#E8D8C4]">
                        <span className="text-[10px] text-[#8B7355] font-bold block">BALANCE DUE</span>
                        <p className="font-extrabold text-[#B85228] mt-0.5">
                          ₹{Math.max(0, (selectedFee.totalAmount || 0) - (selectedFee.paidAmount || 0)).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedFee.remarks && (
                    <div>
                      <span className="font-bold text-[#2F2925] block mb-1">Remarks / Ledger Notes:</span>
                      <p className="p-3 bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl text-xs text-[#5A4A3A]">
                        {selectedFee.remarks}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PAYMENTS */}
              {detailsTab === "PAYMENTS" && (
                <div className="space-y-3">
                  {(!selectedFee.payments || selectedFee.payments.length === 0) ? (
                    <div className="py-8 text-center text-xs text-[#8B7355] bg-[#FDF0DC]/20 border border-[#E8D8C4] rounded-xl">
                      No payments have been recorded for this invoice.
                    </div>
                  ) : (
                    selectedFee.payments.map((p, idx) => (
                      <div
                        key={p._id || idx}
                        className="p-3.5 bg-white border border-[#E8D8C4] rounded-xl space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-700 text-sm">
                            ₹{Number(p.amount).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] text-[#8B7355] font-semibold">
                            {new Date(p.paidAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8B7355] pt-1 border-t border-[#E8D8C4]/50">
                          <div>
                            Method: <strong className="text-[#2F2925]">{p.paymentMethod}</strong>
                          </div>
                          <div className="text-right">
                            Receipt: <strong className="text-[#2F2925]">{p.receiptNo || "—"}</strong>
                          </div>
                        </div>
                        {p.transactionId && (
                          <div className="text-[10px] text-[#8B7355]">
                            UTR / Txn: <code className="font-mono text-[#2F2925]">{p.transactionId}</code>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: REVISIONS AUDIT LOG */}
              {detailsTab === "REVISIONS" && (
                <div className="space-y-3">
                  {(!selectedFee.editHistory || selectedFee.editHistory.length === 0) ? (
                    <div className="py-8 text-center text-xs text-[#8B7355] bg-[#FDF0DC]/20 border border-[#E8D8C4] rounded-xl">
                      No historical revisions have been recorded for this statement.
                    </div>
                  ) : (
                    selectedFee.editHistory.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="p-3.5 bg-white border border-[#E8D8C4] rounded-xl space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2F2925] text-xs">
                            {item.editorName || "Admin"}
                          </span>
                          <span className="text-[10px] text-[#8B7355]">
                            {new Date(item.editedAt).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#5A4A3A] bg-[#FDF0DC]/40 p-2 rounded-lg italic">
                          "{item.reason || "Invoice updated"}"
                        </p>
                        {item.changes && item.changes.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-[#E8D8C4]/60">
                            {item.changes.map((c, cIdx) => (
                              <div key={cIdx} className="text-[10px] flex items-center justify-between">
                                <span className="text-[#8B7355]">{c.fieldLabel}:</span>
                                <span className="font-mono text-[#2F2925]">
                                  {String(c.oldVal)} → <strong>{String(c.newVal)}</strong>
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E8D8C4] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
