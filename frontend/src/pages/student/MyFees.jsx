import { useEffect, useState } from "react";
import { feeService, getErrorMessage } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { generateFeeReceiptPdf } from "../../utils/feeReceiptPdf";
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  CreditCard,
  History,
  Download,
  RefreshCw,
  Printer,
  X,
  Building,
  ShieldCheck,
  CheckCheck,
  ChevronRight,
  QrCode,
  Lock,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function MyFees() {
  const { user } = useAuth();
  const student = user?.student || {};

  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({
    totalBilled: 0,
    totalPaid: 0,
    totalDue: 0,
    overdueCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Receipt Modal
  const [selectedFee, setSelectedFee] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [activePaymentForPrint, setActivePaymentForPrint] = useState(null);

  // Student Payment Checkout Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payingFee, setPayingFee] = useState(null);
  const [payAmountType, setPayAmountType] = useState("FULL"); // "FULL" | "CUSTOM"
  const [payAmountInput, setPayAmountInput] = useState("");
  const [payMode, setPayMode] = useState("UPI"); // "UPI" | "CARD" | "NETBANKING"
  const [upiId, setUpiId] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay");
  const [cardForm, setCardForm] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [selectedBank, setSelectedBank] = useState("State Bank of India");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Success Celebration Modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [completedPayment, setCompletedPayment] = useState(null);
  const [completedFee, setCompletedFee] = useState(null);

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

  const openReceiptModal = (fee) => {
    setSelectedFee(fee);
    setIsReceiptModalOpen(true);
  };

  const handlePrintReceipt = (payment) => {
    setActivePaymentForPrint(payment);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const handleDownloadPdf = (payment, fee) => {
    const studentInfo = {
      Rollno: student.Rollno || user?.rollno || fee?.studentRollno,
      Name: student.Name || user?.name || "Hostel Resident",
      Roomno: student.Roomno || user?.roomno || "—",
      Block: student.Block || user?.block || "—",
      Course: student.Course || user?.course || "—",
    };
    generateFeeReceiptPdf(payment, fee, studentInfo);
  };

  const openPayModal = (fee) => {
    setPayingFee(fee);
    const balance = Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0));
    setPayAmountType("FULL");
    setPayAmountInput(balance);
    setPayMode("UPI");
    setPaymentError("");
    setIsPayModalOpen(true);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText("kiethostel@upi");
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!payingFee) return;

    const balance = Math.max(0, (payingFee.totalAmount || 0) - (payingFee.paidAmount || 0));
    const amountToPay = payAmountType === "FULL" ? balance : Number(payAmountInput);

    if (!amountToPay || amountToPay <= 0) {
      setPaymentError("Please enter a valid payment amount.");
      return;
    }
    if (amountToPay > balance) {
      setPaymentError(`Payment amount cannot exceed outstanding balance of ₹${balance.toLocaleString("en-IN")}.`);
      return;
    }

    setProcessingPayment(true);
    setPaymentError("");

    let paymentMethodName = "Online / UPI";
    if (payMode === "CARD") {
      paymentMethodName = "Debit / Credit Card";
    } else if (payMode === "NETBANKING") {
      paymentMethodName = `Net Banking (${selectedBank})`;
    }

    try {
      const res = await feeService.studentPay(payingFee._id, {
        amount: amountToPay,
        paymentMethod: paymentMethodName,
      });

      const updatedFee = res.data?.fee;
      const paymentObj = res.data?.payment;

      setIsPayModalOpen(false);
      setCompletedFee(updatedFee || payingFee);
      setCompletedPayment(paymentObj);
      setIsSuccessModalOpen(true);

      // Refresh student's dues immediately
      fetchMyFees();
    } catch (err) {
      setPaymentError(getErrorMessage(err, "Payment could not be processed. Please try again."));
    } finally {
      setProcessingPayment(false);
    }
  };

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
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E8D8C4]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#2F2925] tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-[#EB8055]" />
            My Fee Dues & Receipts
          </h1>
          <p className="text-xs text-[#8B7355] mt-1">
            Check your hostel and mess fee statements, review payment history, and download official payment receipts.
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
              Action Required: {stats.overdueCount} Overdue Invoice{stats.overdueCount > 1 ? "s" : ""}
            </span>
            <p className="mt-0.5 text-rose-800">
              One or more fee dues have passed their payment deadline. Please settle outstanding dues at the hostel office
              or contact the warden to prevent late fines.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Outstanding Dues */}
        <div className="p-4.5 bg-white border border-[#E8D8C4] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">
              Total Outstanding Due
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                stats.totalDue > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {stats.totalDue > 0 ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </div>
          </div>
          <p
            className={`text-2xl font-black mt-2.5 ${
              stats.totalDue > 0 ? "text-[#B85228]" : "text-emerald-700"
            }`}
          >
            ₹{Number(stats.totalDue || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#8B7355] mt-1 font-medium">
            {stats.totalDue === 0 ? "✓ All current fee invoices are fully cleared" : "Payable to hostel administration"}
          </p>
        </div>

        {/* Total Paid */}
        <div className="p-4.5 bg-white border border-[#E8D8C4] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Total Paid</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2.5">
            ₹{Number(stats.totalPaid || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#8B7355] mt-1 font-medium">Verified by hostel accounts</p>
        </div>

        {/* Total Invoiced */}
        <div className="p-4.5 bg-white border border-[#E8D8C4] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Total Invoiced</span>
            <div className="w-8 h-8 rounded-xl bg-[#FDF0DC] flex items-center justify-center text-[#EB8055]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#2F2925] mt-2.5">
            ₹{Number(stats.totalBilled || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#8B7355] mt-1 font-medium">
            Across {fees.length} fee invoice{fees.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* INVOICES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#2F2925] flex items-center gap-2">
            <span>Fee Statements & Invoices</span>
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
              const hasPayments = fee.payments && fee.payments.length > 0;

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

                  {/* Card bottom buttons */}
                  <div className="pt-3 border-t border-[#E8D8C4]/60 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] text-[#8B7355] font-semibold">
                      {hasPayments ? `${fee.payments.length} payment receipt(s)` : "No payments logged"}
                    </span>

                    <div className="flex items-center gap-2">
                      {hasPayments && (
                        <button
                          type="button"
                          onClick={() => openReceiptModal(fee)}
                          className="px-3 py-1.5 bg-[#FDF0DC] hover:bg-[#F5E8D4] text-[#2F2925] border border-[#E8D8C4] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <History className="w-3.5 h-3.5 text-[#EB8055]" />
                          <span>Receipts</span>
                        </button>
                      )}

                      {!isSettled ? (
                        <button
                          type="button"
                          onClick={() => openPayModal(fee)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-[#EB8055] to-[#B85228] hover:from-[#d97248] hover:to-[#a34720] text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-[#EB8055]/30 active:scale-95"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openReceiptModal(fee)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Settled</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RECEIPT & PAYMENT HISTORY MODAL */}
      {isReceiptModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#E8D8C4] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E8D8C4] px-6 py-4">
              <div>
                <h3 className="text-base font-extrabold text-[#2F2925] flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#EB8055]" />
                  Fee Receipt Details
                </h3>
                <p className="text-[11px] text-[#8B7355] mt-0.5">
                  {selectedFee.feeType} • {selectedFee.academicYear} ({selectedFee.term || "Full Year"})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Official Receipt Header Box */}
              <div className="p-4 bg-[#FDF0DC]/50 border border-[#E8D8C4] rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#E8D8C4] pb-2">
                  <div>
                    <span className="font-black text-sm text-[#2F2925] tracking-wide">
                      KIET HOSTEL MANAGEMENT
                    </span>
                    <span className="text-[10px] text-[#8B7355] block">Official Fee Invoice Statement</span>
                  </div>
                  <div>{renderStatusBadge(selectedFee.status)}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#8B7355] font-bold block">STUDENT ROLL NO</span>
                    <span className="font-extrabold text-[#2F2925]">{selectedFee.studentRollno}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B7355] font-bold block">INVOICE DATE</span>
                    <span className="font-semibold text-[#2F2925]">
                      {new Date(selectedFee.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B7355] font-bold block">FEE CATEGORY</span>
                    <span className="font-semibold text-[#2F2925]">{selectedFee.feeType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B7355] font-bold block">DUE DATE</span>
                    <span className="font-semibold text-[#2F2925]">
                      {selectedFee.dueDate
                        ? new Date(selectedFee.dueDate).toLocaleDateString("en-IN")
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8D8C4] grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#8B7355] font-bold">TOTAL BILLED</span>
                    <p className="font-extrabold text-[#2F2925]">
                      ₹{Number(selectedFee.totalAmount).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B7355] font-bold">PAID TO DATE</span>
                    <p className="font-extrabold text-emerald-700">
                      ₹{Number(selectedFee.paidAmount || 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8B7355] font-bold">BALANCE DUE</span>
                    <p className="font-extrabold text-[#B85228]">
                      ₹{Math.max(0, selectedFee.totalAmount - (selectedFee.paidAmount || 0)).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Administrative Revision Notice if Edited */}
              {(selectedFee.isEdited || (selectedFee.editHistory && selectedFee.editHistory.length > 0)) && (
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-950">
                    <History className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Official Invoice Revision Notice</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    This invoice was revised by Hostel Accounts on{" "}
                    {new Date(selectedFee.lastEditedAt || selectedFee.updatedAt).toLocaleDateString("en-IN")}.
                    {selectedFee.editHistory && selectedFee.editHistory.length > 0 && selectedFee.editHistory[selectedFee.editHistory.length - 1]?.reason && (
                      <span className="italic block mt-0.5">
                        Note: "{selectedFee.editHistory[selectedFee.editHistory.length - 1].reason}"
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Transactions List */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-[#2F2925] block">
                  Payment History & Receipts ({selectedFee.payments?.length || 0})
                </span>

                {(!selectedFee.payments || selectedFee.payments.length === 0) ? (
                  <div className="py-6 text-center text-xs text-[#8B7355] bg-white border border-[#E8D8C4] rounded-xl">
                    No payments have been recorded yet for this invoice.
                  </div>
                ) : (
                  selectedFee.payments.map((p, idx) => (
                    <div
                      key={p._id || idx}
                      className="p-3.5 bg-white border border-[#E8D8C4] rounded-xl space-y-2 shadow-2xs hover:border-[#EB8055]/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-black text-emerald-700">
                            ₹{Number(p.amount).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[11px] text-[#8B7355] ml-2">via {p.paymentMethod}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(p, selectedFee)}
                            className="px-2.5 py-1 bg-[#EB8055] hover:bg-[#d97248] text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Download Official PDF Receipt"
                          >
                            <Download className="w-3 h-3" />
                            <span>PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintReceipt(p)}
                            className="px-2.5 py-1 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                            title="Print this receipt slip"
                          >
                            <Printer className="w-3 h-3 text-[#EB8055]" />
                            <span>Print</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8B7355] pt-1.5 border-t border-[#E8D8C4]/50">
                        <div>
                          Receipt No: <strong className="text-[#2F2925]">{p.receiptNo || "—"}</strong>
                        </div>
                        <div className="text-right">
                          Date:{" "}
                          <strong className="text-[#2F2925]">
                            {new Date(p.paidAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </strong>
                        </div>
                      </div>

                      {p.transactionId && (
                        <div className="text-[10px] text-[#8B7355]">
                          Transaction/UTR: <span className="font-mono text-[#2F2925]">{p.transactionId}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 border-t border-[#E8D8C4] flex items-center justify-between">
              <span className="text-[10px] text-[#8B7355]">
                Download or print your verified official receipt for clearance.
              </span>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT CHECKOUT MODAL */}
      {isPayModalOpen && payingFee && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E8D8C4] max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8D8C4] px-5 py-3.5 bg-gradient-to-r from-[#FDF0DC] to-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#EB8055] text-white flex items-center justify-center shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#2F2925] tracking-tight">
                    Instant Hostel Fee Checkout
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#8B7355]">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>256-Bit SSL Encrypted & Verified Portal</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-[#FDF0DC] flex items-center justify-center text-[#8B7355] hover:text-[#2F2925] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleProcessPayment} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Fee Bill Summary Badge */}
              <div className="p-3.5 bg-[#FDF0DC]/60 border border-[#E8D8C4] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider block">
                    {payingFee.academicYear} • {payingFee.term || "Full Year"}
                  </span>
                  <span className="text-sm font-extrabold text-[#2F2925]">{payingFee.feeType}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider block">
                    Outstanding Balance
                  </span>
                  <span className="text-base font-black text-[#B85228]">
                    ₹{Math.max(0, (payingFee.totalAmount || 0) - (payingFee.paidAmount || 0)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Amount Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2F2925] block">Select Payment Amount</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPayAmountType("FULL");
                      setPayAmountInput(Math.max(0, (payingFee.totalAmount || 0) - (payingFee.paidAmount || 0)));
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      payAmountType === "FULL"
                        ? "bg-[#EB8055]/10 border-[#EB8055] text-[#2F2925]"
                        : "bg-white border-[#E8D8C4] hover:bg-[#FDF0DC]/30 text-[#5A4A3A]"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-[#8B7355]">
                      Full Balance
                    </span>
                    <span className="text-sm font-extrabold text-[#2F2925]">
                      ₹{Math.max(0, (payingFee.totalAmount || 0) - (payingFee.paidAmount || 0)).toLocaleString("en-IN")}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayAmountType("CUSTOM")}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      payAmountType === "CUSTOM"
                        ? "bg-[#EB8055]/10 border-[#EB8055] text-[#2F2925]"
                        : "bg-white border-[#E8D8C4] hover:bg-[#FDF0DC]/30 text-[#5A4A3A]"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-[#8B7355]">
                      Partial Payment
                    </span>
                    <span className="text-sm font-extrabold text-[#2F2925]">Custom Amount</span>
                  </button>
                </div>

                {payAmountType === "CUSTOM" && (
                  <div className="pt-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8B7355]">₹</span>
                      <input
                        type="number"
                        min="1"
                        max={Math.max(0, (payingFee.totalAmount || 0) - (payingFee.paidAmount || 0))}
                        value={payAmountInput}
                        onChange={(e) => setPayAmountInput(e.target.value)}
                        placeholder="Enter payment amount"
                        className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-[#E8D8C4] rounded-xl focus:outline-none focus:border-[#EB8055] font-bold text-[#2F2925]"
                      />
                    </div>
                    <span className="text-[10px] text-[#8B7355] mt-1 block">
                      Up to maximum due: ₹{Math.max(0, (payingFee.totalAmount || 0) - (payingFee.paidAmount || 0)).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Method Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2F2925] block">Payment Method</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FDF0DC]/60 border border-[#E8D8C4] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPayMode("UPI")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      payMode === "UPI"
                        ? "bg-white text-[#EB8055] shadow-xs"
                        : "text-[#8B7355] hover:text-[#2F2925]"
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMode("CARD")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      payMode === "CARD"
                        ? "bg-white text-[#EB8055] shadow-xs"
                        : "text-[#8B7355] hover:text-[#2F2925]"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayMode("NETBANKING")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      payMode === "NETBANKING"
                        ? "bg-white text-[#EB8055] shadow-xs"
                        : "text-[#8B7355] hover:text-[#2F2925]"
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Net Banking</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: UPI / QR */}
              {payMode === "UPI" && (
                <div className="p-4 bg-white border border-[#E8D8C4] rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Simulated Institutional QR Code */}
                    <div className="w-28 h-28 bg-[#FDF0DC]/70 border border-[#E8D8C4] rounded-2xl flex flex-col items-center justify-center p-2 shrink-0 shadow-2xs relative">
                      <QrCode className="w-16 h-16 text-[#2F2925]" />
                      <span className="text-[9px] font-black text-[#EB8055] tracking-tight mt-1">KIET HOSTEL PAY</span>
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div className="text-xs">
                        <span className="text-[#8B7355] block">KIET Official UPI ID:</span>
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                          <code className="text-xs font-mono font-bold bg-[#FDF0DC] text-[#2F2925] px-2 py-0.5 rounded-lg border border-[#E8D8C4]">
                            kiethostel@upi
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="p-1 hover:bg-[#FDF0DC] rounded text-[#8B7355] hover:text-[#EB8055] cursor-pointer transition-colors"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-[#8B7355]">
                        Scan via Google Pay, PhonePe, Paytm, or BHIM. Instant confirmation and receipt generation.
                      </p>

                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-[10px] font-bold text-[#8B7355]">
                        <span className="px-1.5 py-0.5 bg-[#FDF0DC]/80 rounded border border-[#E8D8C4]/60">GPay</span>
                        <span className="px-1.5 py-0.5 bg-[#FDF0DC]/80 rounded border border-[#E8D8C4]/60">PhonePe</span>
                        <span className="px-1.5 py-0.5 bg-[#FDF0DC]/80 rounded border border-[#E8D8C4]/60">Paytm</span>
                        <span className="px-1.5 py-0.5 bg-[#FDF0DC]/80 rounded border border-[#E8D8C4]/60">BHIM</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#8B7355] block mb-1">
                      Your UPI ID / VPA (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. yourname@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#FDF0DC]/20 border border-[#E8D8C4] rounded-xl focus:outline-none focus:border-[#EB8055] text-[#2F2925]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: CREDIT / DEBIT CARD */}
              {payMode === "CARD" && (
                <div className="p-4 bg-white border border-[#E8D8C4] rounded-2xl space-y-3 shadow-2xs">
                  <div>
                    <label className="text-[11px] font-bold text-[#8B7355] block mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-[#8B7355] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength="19"
                        placeholder="4532 •••• •••• 8892"
                        value={cardForm.number}
                        onChange={(e) => setCardForm({ ...cardForm, number: e.target.value })}
                        className="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-white border border-[#E8D8C4] rounded-xl focus:outline-none focus:border-[#EB8055] text-[#2F2925]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#8B7355] block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Name on card"
                      value={cardForm.name}
                      onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8D8C4] rounded-xl focus:outline-none focus:border-[#EB8055] text-[#2F2925]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#8B7355] block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        maxLength="5"
                        placeholder="MM/YY"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#E8D8C4] rounded-xl focus:outline-none focus:border-[#EB8055] text-[#2F2925]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#8B7355] block mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        maxLength="4"
                        placeholder="•••"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-[#E8D8C4] rounded-xl focus:outline-none focus:border-[#EB8055] text-[#2F2925]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: NET BANKING */}
              {payMode === "NETBANKING" && (
                <div className="p-4 bg-white border border-[#E8D8C4] rounded-2xl space-y-3 shadow-2xs">
                  <label className="text-[11px] font-bold text-[#8B7355] block">Popular Indian Banks</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["State Bank of India", "HDFC Bank", "ICICI Bank", "Punjab National Bank"].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                          selectedBank === bank
                            ? "bg-[#EB8055]/10 border-[#EB8055] text-[#2F2925]"
                            : "bg-white border-[#E8D8C4] hover:bg-[#FDF0DC]/30 text-[#8B7355]"
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#8B7355] block mb-1">Other Available Banks</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E8D8C4] rounded-xl focus:outline-none focus:border-[#EB8055] text-[#2F2925]"
                    >
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Union Bank of India">Union Bank of India</option>
                      <option value="IDBI Bank">IDBI Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Payment Error */}
              {paymentError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Institutional Note */}
              <div className="p-2.5 bg-[#FDF0DC]/40 border border-[#E8D8C4]/60 rounded-xl text-[10px] text-[#8B7355] flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#EB8055] shrink-0" />
                <span>
                  Immediate verified ledger update. An official PDF receipt with verification barcode will be generated instantly.
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 border-t border-[#E8D8C4] flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  disabled={processingPayment}
                  className="px-4 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={processingPayment}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#EB8055] to-[#B85228] hover:from-[#d97248] hover:to-[#a34720] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#EB8055]/30 active:scale-98 disabled:opacity-70"
                >
                  {processingPayment ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        Pay ₹
                        {payAmountType === "FULL"
                          ? Math.max(0, (payingFee.totalAmount || 0) - (payingFee.paidAmount || 0)).toLocaleString("en-IN")
                          : Number(payAmountInput || 0).toLocaleString("en-IN")}{" "}
                        Securely
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT SUCCESS CELEBRATION & RECEIPT DOWNLOAD MODAL */}
      {isSuccessModalOpen && completedPayment && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#E8D8C4] p-6 text-center space-y-4">
            {/* Green Success Badge */}
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-1">
                Transaction Verified
              </span>
              <h3 className="text-xl font-black text-[#2F2925] tracking-tight">Payment Successful!</h3>
              <p className="text-xs text-[#8B7355] mt-1">
                Your payment has been logged and verified by the hostel finance system.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-4 bg-[#FDF0DC]/50 border border-[#E8D8C4] rounded-2xl text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#E8D8C4]">
                <span className="text-[#8B7355]">Amount Paid:</span>
                <span className="text-base font-black text-emerald-700">
                  ₹{Number(completedPayment.amount).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[10px] text-[#8B7355] block">Receipt Number</span>
                  <span className="font-extrabold text-[#2F2925] font-mono">{completedPayment.receiptNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8B7355] block">Transaction ID</span>
                  <span className="font-semibold text-[#2F2925] font-mono truncate block" title={completedPayment.transactionId}>
                    {completedPayment.transactionId}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8B7355] block">Payment Method</span>
                  <span className="font-semibold text-[#2F2925]">{completedPayment.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8B7355] block">Fee Head</span>
                  <span className="font-semibold text-[#2F2925]">{completedFee?.feeType || "Hostel Fee"}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadPdf(completedPayment, completedFee)}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#EB8055] to-[#B85228] hover:from-[#d97248] hover:to-[#a34720] text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#EB8055]/30 active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF Receipt</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Back to My Dues
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
