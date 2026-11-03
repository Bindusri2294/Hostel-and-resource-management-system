import { useEffect, useState } from "react";
import { feeService, getErrorMessage } from "../../services/api";
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  History,
  RefreshCw,
  DollarSign,
} from "lucide-react";

export default function MyFees() {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalDue: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyFees = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await feeService.mine();
      setFees(res.data?.fees || []);
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not load fee records."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFees();
  }, []);

  const renderStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Paid
          </span>
        );
      case "Partially Paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Partially Paid
          </span>
        );
      case "Overdue":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDF0DC] text-[#B85228] border border-[#E8D8C4]">
            <Clock className="w-3.5 h-3.5 text-[#B85228]" />
            Unpaid
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E8D8C4]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2925] tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-[#EB8055]" />
            My Fee Statements
          </h1>
          <p className="text-xs text-[#8B7355] mt-1">
            Check your official hostel and mess fee account statements and review balance dues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMyFees}
            className="px-3.5 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8B7355] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* OVERDUE ALERT BANNER */}
      {stats.overdueCount > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-semibold flex items-start gap-3 shadow-xs animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-rose-950 block text-sm">
              Notice: {stats.overdueCount} Overdue Invoice{stats.overdueCount > 1 ? "s" : ""}
            </span>
            <p className="mt-0.5 text-rose-800">
              One or more fee dues have passed their payment deadline. Please settle outstanding dues at the hostel accounts office
              or contact your warden to avoid late registration holds.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4.5 bg-white border border-[#E8D8C4] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Total Outstanding</span>
            <div className="w-8 h-8 rounded-xl bg-[#FDF0DC] flex items-center justify-center text-[#B85228]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#B85228] mt-2.5">
            ₹{Number(stats.totalDue || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#8B7355] mt-1 font-medium">Pending balance to clear</p>
        </div>

        <div className="p-4.5 bg-white border border-[#E8D8C4] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Total Paid</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2.5">
            ₹{Number(stats.totalPaid || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#8B7355] mt-1 font-medium">Verified payments to date</p>
        </div>

        <div className="p-4.5 bg-white border border-[#E8D8C4] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Total Invoiced</span>
            <div className="w-8 h-8 rounded-xl bg-[#FDF0DC] flex items-center justify-center text-[#EB8055]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#2F2925] mt-2.5">
            ₹{Number(stats.totalBilled || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#8B7355] mt-1 font-medium">
            Across {fees.length} statement{fees.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* INVOICES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#2F2925] flex items-center gap-2">
            <span>Fee Statements</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FDF0DC] text-[#B85228] font-bold">
              {fees.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-[#8B7355] font-semibold flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-[#E8D8C4]">
            <div className="w-6 h-6 border-2 border-[#EB8055] border-t-transparent rounded-full animate-spin" />
            <span>Fetching your fee records...</span>
          </div>
        ) : fees.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E8D8C4] rounded-2xl space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FDF0DC] text-[#EB8055] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#2F2925]">No Fee Records Available</h3>
            <p className="text-xs text-[#8B7355] max-w-sm mx-auto">
              You currently do not have any fee dues or invoices registered under your roll number. Contact the admin office if you believe this is an error.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fees.map((fee) => {
              const balance = Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0));
              const isSettled = balance === 0;

              return (
                <div
                  key={fee._id}
                  className="bg-white border border-[#E8D8C4] rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:border-[#EB8055]/50 transition-all"
                >
                  {/* Card top */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider block">
                          {fee.academicYear} • {fee.term || "Full Year"}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-base font-extrabold text-[#2F2925] mt-0.5">{fee.feeType}</h3>
                          {(fee.isEdited || (fee.editHistory && fee.editHistory.length > 0)) && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 mt-0.5">
                              <History className="w-2.5 h-2.5 text-amber-600" />
                              <span>Revised</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div>{renderStatusBadge(fee.status)}</div>
                    </div>

                    {/* Due Date & Remarks */}
                    <div className="flex items-center gap-2 text-xs text-[#5A4A3A]">
                      <Calendar className="w-3.5 h-3.5 text-[#8B7355]" />
                      <span>
                        Due Date:{" "}
                        <strong className="text-[#2F2925]">
                          {fee.dueDate
                            ? new Date(fee.dueDate).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </strong>
                      </span>
                    </div>

                    {fee.remarks && (
                      <p className="text-[11px] text-[#8B7355] italic bg-[#FDF0DC]/30 p-2 rounded-xl">
                        "{fee.remarks}"
                      </p>
                    )}

                    {/* Amount progress */}
                    <div className="p-3 bg-[#FDF0DC]/40 border border-[#E8D8C4]/70 rounded-xl space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#8B7355]">Amount Billed:</span>
                        <span className="text-[#2F2925]">
                          ₹{Number(fee.totalAmount).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#8B7355]">Amount Paid:</span>
                        <span className="text-emerald-700">
                          ₹{Number(fee.paidAmount || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs font-extrabold pt-1.5 border-t border-[#E8D8C4] text-[#B85228]">
                        <span>Remaining Balance:</span>
                        <span className="text-sm">₹{balance.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card bottom settlement info */}
                  <div className="pt-3 border-t border-[#E8D8C4]/60 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#8B7355] font-semibold">
                      {isSettled ? "Fully Settled" : `Pending Balance: ₹${balance.toLocaleString("en-IN")}`}
                    </span>

                    {isSettled ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Settled</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
