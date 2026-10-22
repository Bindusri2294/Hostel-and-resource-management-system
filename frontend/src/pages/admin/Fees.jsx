import { useEffect, useState } from "react";
import { feeService, studentService, getErrorMessage } from "../../services/api";
import {
  Receipt,
  Search,
  Plus,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  X,
  CreditCard,
  Edit2,
  History,
  ArrowRight,
  Filter,
  CheckCheck,
  Building,
  Users,
  User,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  SlidersHorizontal,
  Layers,
  ShieldCheck,
  CheckSquare,
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
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState("PAYMENTS"); // "PAYMENTS" | "EDITS"

  // Selected fee item for modals
  const [selectedFee, setSelectedFee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Student roll numbers list for autocomplete / helper
  const [studentSuggestions, setStudentSuggestions] = useState([]);

  // Form states
  const currentMonthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const [createForm, setCreateForm] = useState({
    targetType: "ALL", // "ALL" | "BLOCK" | "SINGLE"
    targetBlock: "D",
    studentRollno: "",
    feeType: "Mess Fee",
    academicYear: "2025-2026",
    term: currentMonthName,
    totalAmount: "",
    paidAmount: "",
    dueDate: "",
    initialPaymentMethod: "Cash",
    receiptNo: "",
    transactionId: "",
    remarks: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "Online / UPI",
    transactionId: "",
    receiptNo: "",
    notes: "",
  });

  const [editForm, setEditForm] = useState({
    feeType: "Hostel Fee",
    academicYear: "2025-2026",
    term: "Full Year",
    totalAmount: "",
    dueDate: "",
    remarks: "",
    editReason: "",
  });

  // Bulk selection and batch action state
  const [selectedFeeIds, setSelectedFeeIds] = useState([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState("ADJUST"); // "ADJUST" | "VOID"
  const [bulkScope, setBulkScope] = useState("SELECTED"); // "SELECTED" | "BATCH"
  const [bulkForm, setBulkForm] = useState({
    targetType: "ALL", // "ALL" | "BLOCK"
    targetBlock: "D",
    feeType: "Mess Fee",
    academicYear: "2025-2026",
    term: currentMonthName,
    adjustmentType: "REDUCE_BY", // "REDUCE_BY" | "SET_TOTAL"
    amount: "",
    newDueDate: "",
    remarks: "",
    editReason: "",
  });

  // Fetch fees
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

  // Initial load & students list fetch
  useEffect(() => {
    fetchFees();
    studentService
      .list()
      .then((res) => {
        const list = (res.data || []).map((s) => ({
          rollNo: s.Rollno,
          roomNo: s.Roomno,
          block: s.Block,
          status: s.Status || "Active",
        }));
        setStudentSuggestions(list);
      })
      .catch((e) => console.warn("Could not fetch students list:", e.message));
  }, []);

  // Filtered active students helpers for batch invoicing
  const activeStudents = studentSuggestions.filter(
    (s) => String(s.status || "Active").toLowerCase() === "active"
  );
  const getActiveStudentsInBlock = (block) =>
    activeStudents.filter((s) => (s.block || "D") === block);

  // Refetch when filters change
  useEffect(() => {
    fetchFees();
  }, [statusFilter, typeFilter, yearFilter]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFees();
  };

  // Auto clear message after 4s
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(""), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // Create Fee (Single or Batch)
  const handleCreateFee = async (e) => {
    e.preventDefault();
    if (createForm.targetType === "SINGLE" && !createForm.studentRollno.trim()) {
      setError("Please specify a Student Roll Number.");
      return;
    }
    if (!createForm.totalAmount || !createForm.dueDate) {
      setError("Please fill in Total Amount and Due Date.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      if (createForm.targetType === "SINGLE") {
        await feeService.create({
          ...createForm,
          studentRollno: createForm.studentRollno.trim().toUpperCase(),
          totalAmount: Number(createForm.totalAmount),
          paidAmount: createForm.paidAmount ? Number(createForm.paidAmount) : 0,
        });
        setSuccessMsg(`Fee invoice created for ${createForm.studentRollno.toUpperCase()}.`);
      } else {
        const res = await feeService.createBatch({
          targetType: createForm.targetType,
          targetBlock: createForm.targetBlock,
          feeType: createForm.feeType,
          academicYear: createForm.academicYear,
          term: createForm.term,
          totalAmount: Number(createForm.totalAmount),
          dueDate: createForm.dueDate,
          remarks: createForm.remarks,
        });
        setSuccessMsg(res.data?.message || "Batch invoices generated successfully.");
      }

      setIsCreateModalOpen(false);
      setCreateForm({
        targetType: "ALL",
        targetBlock: "D",
        studentRollno: "",
        feeType: "Mess Fee",
        academicYear: "2025-2026",
        term: currentMonthName,
        totalAmount: "",
        paidAmount: "",
        dueDate: "",
        initialPaymentMethod: "Cash",
        receiptNo: "",
        transactionId: "",
        remarks: "",
      });
      fetchFees();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to create fee record(s)."));
    } finally {
      setSubmitting(false);
    }
  };

  // Open Record Payment Modal
  const openPaymentModal = (fee) => {
    setSelectedFee(fee);
    const balance = Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0));
    setPaymentForm({
      amount: balance,
      paymentMethod: "Online / UPI",
      transactionId: "",
      receiptNo: `RCP-${Date.now().toString().slice(-6)}`,
      notes: "",
    });
    setIsPaymentModalOpen(true);
  };

  // Submit Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) {
      setError("Please specify a valid payment amount.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await feeService.recordPayment(selectedFee._id, {
        ...paymentForm,
        amount: Number(paymentForm.amount),
      });
      setSuccessMsg(`Payment of ₹${Number(paymentForm.amount).toLocaleString("en-IN")} recorded.`);
      setIsPaymentModalOpen(false);
      setSelectedFee(null);
      fetchFees();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to record payment."));
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (fee) => {
    setSelectedFee(fee);
    setEditForm({
      feeType: fee.feeType,
      academicYear: fee.academicYear,
      term: fee.term || "Full Year",
      totalAmount: fee.totalAmount,
      dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().slice(0, 10) : "",
      remarks: fee.remarks || "",
      editReason: "",
    });
    setIsEditModalOpen(true);
  };

  // Submit Edit
  const handleUpdateFee = async (e) => {
    e.preventDefault();
    if (!editForm.editReason?.trim()) {
      setError("Please provide a reason for revising this fee invoice.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await feeService.update(selectedFee._id, {
        ...editForm,
        totalAmount: Number(editForm.totalAmount),
        editReason: editForm.editReason.trim(),
      });
      setSuccessMsg("Fee invoice revised and audit trail updated successfully.");
      setIsEditModalOpen(false);
      setSelectedFee(null);
      fetchFees();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update fee record."));
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFeeIds(fees.map((f) => f._id));
    } else {
      setSelectedFeeIds([]);
    }
  };

  const handleToggleSelectFee = (id) => {
    setSelectedFeeIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openBulkModal = (initialScope = null, initialAction = "ADJUST") => {
    const chosenScope = initialScope || (selectedFeeIds.length > 0 ? "SELECTED" : "BATCH");
    setBulkScope(chosenScope);
    setBulkAction(initialAction);
    setBulkForm((prev) => ({
      ...prev,
      amount: "",
      newDueDate: "",
      remarks: "",
      editReason: "",
    }));
    setIsBulkModalOpen(true);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (bulkAction === "ADJUST") {
      if (!bulkForm.editReason.trim()) {
        setError("Please provide a reason for the bulk revision (required for audit history).");
        return;
      }
      if (!bulkForm.amount && !bulkForm.newDueDate && !bulkForm.remarks) {
        setError("Please specify at least one adjustment field (Amount, Due Date, or Remarks).");
        return;
      }

      setSubmitting(true);
      try {
        const payload = {
          adjustmentType: bulkForm.adjustmentType,
          amount: bulkForm.amount ? Number(bulkForm.amount) : undefined,
          newDueDate: bulkForm.newDueDate || undefined,
          remarks: bulkForm.remarks !== "" ? bulkForm.remarks : undefined,
          editReason: bulkForm.editReason.trim(),
        };

        if (bulkScope === "SELECTED") {
          if (selectedFeeIds.length === 0) {
            setError("No invoices are selected. Please select invoices or switch to Batch Criteria.");
            setSubmitting(false);
            return;
          }
          payload.feeIds = selectedFeeIds;
        } else {
          payload.targetType = bulkForm.targetType;
          payload.targetBlock = bulkForm.targetBlock;
          payload.feeType = bulkForm.feeType;
          payload.academicYear = bulkForm.academicYear;
          payload.term = bulkForm.term;
        }

        const res = await feeService.bulkAdjust(payload);
        setSuccessMsg(res.data?.message || "Bulk adjustment processed successfully.");
        setIsBulkModalOpen(false);
        setSelectedFeeIds([]);
        fetchFees();
      } catch (err) {
        setError(getErrorMessage(err, "Failed to perform bulk adjustment."));
      } finally {
        setSubmitting(false);
      }
    } else if (bulkAction === "VOID") {
      setSubmitting(true);
      try {
        const payload = {};
        if (bulkScope === "SELECTED") {
          if (selectedFeeIds.length === 0) {
            setError("No invoices are selected to void.");
            setSubmitting(false);
            return;
          }
          payload.feeIds = selectedFeeIds;
        } else {
          payload.targetType = bulkForm.targetType;
          payload.targetBlock = bulkForm.targetBlock;
          payload.feeType = bulkForm.feeType;
          payload.academicYear = bulkForm.academicYear;
          payload.term = bulkForm.term;
        }

        const res = await feeService.bulkDelete(payload);
        setSuccessMsg(res.data?.message || "Bulk void completed.");
        setIsBulkModalOpen(false);
        setSelectedFeeIds([]);
        fetchFees();
      } catch (err) {
        setError(getErrorMessage(err, "Failed to void invoices."));
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Open Payment & Edit History Modal
  const openHistoryModal = (fee, defaultTab = "PAYMENTS") => {
    setSelectedFee(fee);
    setHistoryTab(defaultTab);
    setIsHistoryModalOpen(true);
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
    link.setAttribute("download", `Hostel_Fees_${new Date().toISOString().slice(0, 10)}.csv`);
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
            Generate student invoices, track payments, record cash or UPI transactions, and monitor outstanding balances.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-nowrap overflow-x-auto pb-1 xl:pb-0">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={fees.length === 0}
            className="px-3.5 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50 whitespace-nowrap"
            title="Export to CSV"
          >
            <Download className="w-3.5 h-3.5" />
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

          <button
            type="button"
            onClick={() => openBulkModal()}
            className="px-3.5 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
            title="Bulk fee revision and batch management"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#EB8055]" />
            <span>Bulk Actions</span>
            {selectedFeeIds.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 bg-[#EB8055] text-white text-[10px] rounded-full font-extrabold leading-none">
                {selectedFeeIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-[#E8D8C4] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Total Billed</span>
            <div className="w-7 h-7 rounded-lg bg-[#FDF0DC] flex items-center justify-center text-[#EB8055]">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-[#2F2925] mt-2">
            ₹{Number(stats.totalBilled || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-4 bg-white border border-[#E8D8C4] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Total Collected</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-700 mt-2">
            ₹{Number(stats.totalCollected || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-4 bg-white border border-[#E8D8C4] rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">Pending Balance</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-amber-700 mt-2">
            ₹{Number(stats.totalPending || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="p-4 bg-white border border-[#E8D8C4] rounded-2xl shadow-xs">
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

      {/* FEE RECORDS TABLE */}
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
                : "Click '+ Create Invoice' above to issue the first fee invoice."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FDF0DC]/40 border-b border-[#E8D8C4] text-[11px] font-bold text-[#8B7355] uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={fees.length > 0 && selectedFeeIds.length === fees.length}
                      ref={(el) => {
                        if (el) {
                          el.indeterminate =
                            selectedFeeIds.length > 0 && selectedFeeIds.length < fees.length;
                        }
                      }}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-[#E8D8C4] text-[#EB8055] focus:ring-[#EB8055] cursor-pointer accent-[#EB8055]"
                      title="Select all on this page"
                    />
                  </th>
                  <th className="py-3 px-4">Student Roll No</th>
                  <th className="py-3 px-4">Fee Type & Term</th>
                  <th className="py-3 px-4 text-right">Total (₹)</th>
                  <th className="py-3 px-4 text-right">Paid (₹)</th>
                  <th className="py-3 px-4 text-right">Balance (₹)</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8D8C4]/60">
                {fees.map((fee) => {
                  const isSelected = selectedFeeIds.includes(fee._id);
                  const balance = Math.max(0, (fee.totalAmount || 0) - (fee.paidAmount || 0));
                  const isPaid = fee.status === "Paid" || balance === 0;
                  const block = fee.student?.Block;
                  const room = fee.student?.Roomno;

                  return (
                    <tr
                      key={fee._id}
                      className={`transition-colors ${
                        isSelected ? "bg-[#FDF0DC]/60" : "hover:bg-[#FDF0DC]/20"
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectFee(fee._id)}
                          className="w-4 h-4 rounded border-[#E8D8C4] text-[#EB8055] focus:ring-[#EB8055] cursor-pointer accent-[#EB8055]"
                          title={`Select ${fee.studentRollno}`}
                        />
                      </td>
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
                              onClick={() => openHistoryModal(fee, "EDITS")}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer transition-colors shadow-2xs"
                              title="Invoice has been revised. Click to view edit audit log."
                            >
                              <History className="w-2.5 h-2.5 text-amber-600" />
                              <span>Edited ({fee.editHistory?.length || 1}x)</span>
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
                        <div className="inline-flex items-center gap-1">
                          {!isPaid && (
                            <button
                              type="button"
                              onClick={() => openPaymentModal(fee)}
                              className="px-2.5 py-1.5 bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold text-[11px] rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                              title="Record Payment"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Pay</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => openHistoryModal(fee, "PAYMENTS")}
                            className="p-1.5 bg-[#FDF0DC]/50 hover:bg-[#FDF0DC] text-[#2F2925] rounded-lg transition-colors cursor-pointer border border-[#E8D8C4]"
                            title="Payment & Edit Audit History"
                          >
                            <History className="w-3.5 h-3.5 text-[#8B7355]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(fee)}
                            className="p-1.5 bg-[#FDF0DC]/50 hover:bg-[#FDF0DC] text-[#2F2925] rounded-lg transition-colors cursor-pointer border border-[#E8D8C4]"
                            title="Edit / Revise Invoice"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#8B7355]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FLOATING BULK SELECTION ACTION BAR */}
      {selectedFeeIds.length > 0 && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
          <div className="pointer-events-auto bg-[#2F2925] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#443B34] flex flex-wrap items-center gap-3.5 animate-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#EB8055] text-white text-xs font-extrabold flex items-center justify-center">
                {selectedFeeIds.length}
              </span>
              <span className="text-xs font-bold tracking-wide">
                {selectedFeeIds.length} invoice{selectedFeeIds.length > 1 ? "s" : ""} selected
              </span>
            </div>

            <div className="h-4 w-px bg-white/20 hidden sm:block" />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openBulkModal("SELECTED", "ADJUST")}
                className="px-3.5 py-1.5 bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Adjust / Reduce</span>
              </button>

              <button
                type="button"
                onClick={() => openBulkModal("SELECTED", "VOID")}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Void Unpaid</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFeeIds([])}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE INVOICE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#E8D8C4] max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E8D8C4] px-6 py-4">
              <h3 className="text-base font-extrabold text-[#2F2925] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#EB8055]" />
                Generate New Fee Invoice
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFee} className="p-6 space-y-4 overflow-y-auto text-xs font-semibold">
              {/* Target Audience Selector */}
              <div>
                <label className="block text-[#2F2925] mb-1.5 font-bold">
                  Target Audience *
                </label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-[#FDF0DC]/50 border border-[#E8D8C4] rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, targetType: "ALL" })}
                    className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      createForm.targetType === "ALL"
                        ? "bg-[#EB8055] text-white shadow-xs font-extrabold"
                        : "text-[#8B7355] hover:text-[#2F2925]"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Students</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, targetType: "BLOCK" })}
                    className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      createForm.targetType === "BLOCK"
                        ? "bg-[#EB8055] text-white shadow-xs font-extrabold"
                        : "text-[#8B7355] hover:text-[#2F2925]"
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>By Block</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, targetType: "SINGLE" })}
                    className={`py-2 px-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      createForm.targetType === "SINGLE"
                        ? "bg-[#EB8055] text-white shadow-xs font-extrabold"
                        : "text-[#8B7355] hover:text-[#2F2925]"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Single Student</span>
                  </button>
                </div>
              </div>

              {/* Target Preview / Conditional Inputs */}
              {createForm.targetType === "ALL" && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-semibold">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Will generate common invoice for all active students</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                    {activeStudents.length} Students
                  </span>
                </div>
              )}

              {createForm.targetType === "BLOCK" && (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[#2F2925] mb-1 font-bold">Select Hostel Block *</label>
                    <select
                      value={createForm.targetBlock}
                      onChange={(e) => setCreateForm({ ...createForm, targetBlock: e.target.value })}
                      className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-bold text-[#2F2925]"
                    >
                      <option value="D">Block D</option>
                      <option value="E">Block E</option>
                      <option value="KW">Block KW</option>
                      <option value="Executive">Executive Block</option>
                    </select>
                  </div>
                  <div className="p-3 bg-[#FDF0DC]/50 border border-[#E8D8C4] rounded-xl flex items-center justify-between text-xs text-[#2F2925] font-semibold">
                    <span>Active students in Block {createForm.targetBlock}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EB8055] text-white text-[11px] font-extrabold">
                      {getActiveStudentsInBlock(createForm.targetBlock).length} Students
                    </span>
                  </div>
                </div>
              )}

              {createForm.targetType === "SINGLE" && (
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">
                    Student Roll Number * <span className="text-[#8B7355] font-normal">(Case-insensitive)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026-CS-01"
                    value={createForm.studentRollno}
                    onChange={(e) => setCreateForm({ ...createForm, studentRollno: e.target.value.toUpperCase() })}
                    list="student-roll-suggestions"
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-bold uppercase text-[#2F2925]"
                  />
                  <datalist id="student-roll-suggestions">
                    {studentSuggestions.map((s) => (
                      <option key={s.rollNo} value={s.rollNo}>
                        Block {s.block} • Room {s.roomNo}
                      </option>
                    ))}
                  </datalist>
                </div>
              )}

              {/* Fee Type & Academic Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Fee Type *</label>
                  <select
                    value={createForm.feeType}
                    onChange={(e) => setCreateForm({ ...createForm, feeType: e.target.value })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                  >
                    <option value="Mess Fee">Mess Fee</option>
                    <option value="Hostel Fee">Hostel Fee</option>
                    <option value="Maintenance Fee">Maintenance Fee</option>
                    <option value="Caution Deposit">Caution Deposit</option>
                    <option value="Electricity / Utility">Electricity / Utility</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Academic Year *</label>
                  <input
                    type="text"
                    required
                    placeholder="2025-2026"
                    value={createForm.academicYear}
                    onChange={(e) => setCreateForm({ ...createForm, academicYear: e.target.value })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                  />
                </div>
              </div>

              {/* Billing Month / Term & Due Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Billing Month / Term *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. October 2026 or Full Year"
                    value={createForm.term}
                    onChange={(e) => setCreateForm({ ...createForm, term: e.target.value })}
                    list="term-quick-options"
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                  />
                  <datalist id="term-quick-options">
                    <option value="October 2026" />
                    <option value="November 2026" />
                    <option value="December 2026" />
                    <option value="January 2027" />
                    <option value="February 2027" />
                    <option value="March 2027" />
                    <option value="April 2027" />
                    <option value="May 2027" />
                    <option value="Semester 1" />
                    <option value="Semester 2" />
                    <option value="Full Year" />
                  </datalist>
                </div>

                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={createForm.dueDate}
                    onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                  />
                </div>
              </div>

              {/* Total Amount & Initial Paid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">
                    Amount per Student (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 3500"
                    value={createForm.totalAmount}
                    onChange={(e) => setCreateForm({ ...createForm, totalAmount: e.target.value })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-bold text-[#2F2925]"
                  />
                </div>

                {createForm.targetType === "SINGLE" ? (
                  <div>
                    <label className="block text-[#2F2925] mb-1 font-bold">
                      Initial Paid Amount (₹) <span className="text-[#8B7355] font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={createForm.paidAmount}
                      onChange={(e) => setCreateForm({ ...createForm, paidAmount: e.target.value })}
                      className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-bold text-emerald-700"
                    />
                  </div>
                ) : (
                  <div className="p-2.5 bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl flex items-center justify-between text-xs">
                    <span className="text-[#8B7355] font-semibold">Total Estimated Value:</span>
                    <span className="font-extrabold text-[#2F2925]">
                      ₹
                      {(
                        Number(createForm.totalAmount || 0) *
                        (createForm.targetType === "ALL"
                          ? activeStudents.length
                          : getActiveStudentsInBlock(createForm.targetBlock).length)
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              {/* Initial payment details if single student and paid > 0 */}
              {createForm.targetType === "SINGLE" && Number(createForm.paidAmount) > 0 && (
                <div className="p-3 bg-[#FDF0DC]/40 border border-[#E8D8C4] rounded-xl space-y-2">
                  <span className="text-[11px] font-bold text-[#B85228] block">Initial Payment Details</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#8B7355] font-bold">Payment Method</label>
                      <select
                        value={createForm.initialPaymentMethod}
                        onChange={(e) => setCreateForm({ ...createForm, initialPaymentMethod: e.target.value })}
                        className="w-full bg-white border border-[#E8D8C4] rounded-lg p-1.5 text-xs font-semibold text-[#2F2925]"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Online / UPI">Online / UPI</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cheque">Cheque</option>
                        <option value="Demand Draft">Demand Draft</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[#8B7355] font-bold">Transaction / UTR No.</label>
                      <input
                        type="text"
                        placeholder="e.g. UPI-9281928"
                        value={createForm.transactionId}
                        onChange={(e) => setCreateForm({ ...createForm, transactionId: e.target.value })}
                        className="w-full bg-white border border-[#E8D8C4] rounded-lg p-1.5 text-xs text-[#2F2925]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Remarks / Description</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Monthly mess charges for vegetarian/non-vegetarian catering."
                  value={createForm.remarks}
                  onChange={(e) => setCreateForm({ ...createForm, remarks: e.target.value })}
                  className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8D8C4]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    "Processing..."
                  ) : createForm.targetType === "ALL" ? (
                    `Issue ${studentSuggestions.length} Invoices`
                  ) : createForm.targetType === "BLOCK" ? (
                    `Issue ${
                      studentSuggestions.filter((s) => (s.block || "D") === createForm.targetBlock).length
                    } Invoices (Block ${createForm.targetBlock})`
                  ) : (
                    "Generate Invoice"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RECORD PAYMENT */}
      {isPaymentModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#E8D8C4]">
            <div className="flex items-center justify-between border-b border-[#E8D8C4] px-6 py-4">
              <h3 className="text-base font-extrabold text-[#2F2925] flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#EB8055]" />
                Record Fee Payment
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs font-semibold">
              {/* Fee summary card */}
              <div className="p-3 bg-[#FDF0DC]/50 border border-[#E8D8C4] rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[#2F2925]">
                  <span className="font-bold">Student Roll No:</span>
                  <span className="font-extrabold tracking-wide">{selectedFee.studentRollno}</span>
                </div>
                <div className="flex justify-between items-center text-[#8B7355]">
                  <span>Fee Category:</span>
                  <span className="font-semibold text-[#2F2925]">{selectedFee.feeType}</span>
                </div>
                <div className="flex justify-between items-center text-[#8B7355]">
                  <span>Total Amount:</span>
                  <span className="font-bold text-[#2F2925]">
                    ₹{Number(selectedFee.totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#8B7355]">
                  <span>Already Paid:</span>
                  <span className="font-bold text-emerald-700">
                    ₹{Number(selectedFee.paidAmount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#E8D8C4] text-[#B85228]">
                  <span className="font-extrabold">Outstanding Balance:</span>
                  <span className="font-black text-sm">
                    ₹{Math.max(0, selectedFee.totalAmount - (selectedFee.paidAmount || 0)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Amount to pay */}
              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Payment Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(0, selectedFee.totalAmount - (selectedFee.paidAmount || 0))}
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-extrabold text-[#2F2925] text-sm"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Payment Method *</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-semibold text-[#2F2925]"
                >
                  <option value="Online / UPI">Online / UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Demand Draft">Demand Draft</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Receipt No & Transaction ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Receipt Number</label>
                  <input
                    type="text"
                    value={paymentForm.receiptNo}
                    onChange={(e) => setPaymentForm({ ...paymentForm, receiptNo: e.target.value })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                  />
                </div>

                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">UTR / Reference ID</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR10294829"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Payment Note</label>
                <input
                  type="text"
                  placeholder="e.g. Received at hostel counter, cash verified."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8D8C4]">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Recording..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PAYMENT HISTORY */}
      {isHistoryModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#E8D8C4] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E8D8C4] px-6 py-4">
              <div>
                <h3 className="text-base font-extrabold text-[#2F2925] flex items-center gap-2">
                  <History className="w-5 h-5 text-[#EB8055]" />
                  Payment History & Receipts
                </h3>
                <p className="text-[11px] text-[#8B7355] mt-0.5">
                  Roll No: <span className="font-bold text-[#2F2925]">{selectedFee.studentRollno}</span> •{" "}
                  {selectedFee.feeType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Navigation Tabs: Payments vs Edit Revisions */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FDF0DC]/60 border border-[#E8D8C4] rounded-xl">
                <button
                  type="button"
                  onClick={() => setHistoryTab("PAYMENTS")}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    historyTab === "PAYMENTS"
                      ? "bg-white text-[#EB8055] shadow-xs"
                      : "text-[#8B7355] hover:text-[#2F2925]"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Payments ({selectedFee.payments?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryTab("EDITS")}
                  className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    historyTab === "EDITS"
                      ? "bg-white text-[#EB8055] shadow-xs"
                      : "text-[#8B7355] hover:text-[#2F2925]"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Revision History ({selectedFee.editHistory?.length || 0})</span>
                </button>
              </div>

              {/* TAB 1: PAYMENTS */}
              {historyTab === "PAYMENTS" && (
                <div className="space-y-4">
                  {/* Summary box */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-[#FDF0DC]/40 border border-[#E8D8C4] rounded-xl text-center">
                    <div>
                      <span className="text-[10px] text-[#8B7355] font-bold uppercase">Billed</span>
                      <p className="text-sm font-extrabold text-[#2F2925]">
                        ₹{Number(selectedFee.totalAmount).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8B7355] font-bold uppercase">Paid</span>
                      <p className="text-sm font-extrabold text-emerald-700">
                        ₹{Number(selectedFee.paidAmount || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8B7355] font-bold uppercase">Balance</span>
                      <p className="text-sm font-extrabold text-[#B85228]">
                        ₹{Math.max(0, selectedFee.totalAmount - (selectedFee.paidAmount || 0)).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Payments list */}
                  {(!selectedFee.payments || selectedFee.payments.length === 0) ? (
                    <div className="py-8 text-center text-xs text-[#8B7355]">
                      <CreditCard className="w-8 h-8 text-[#8B7355]/40 mx-auto mb-1.5" />
                      No payments have been recorded for this invoice yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <span className="text-xs font-bold text-[#2F2925] block">
                        Recorded Transactions ({selectedFee.payments.length})
                      </span>
                      {selectedFee.payments.map((p, idx) => (
                        <div
                          key={p._id || idx}
                          className="p-3 bg-white border border-[#E8D8C4] rounded-xl space-y-1.5 shadow-2xs hover:border-[#EB8055]/50 transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-emerald-700 text-sm">
                              ₹{Number(p.amount).toLocaleString("en-IN")}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FDF0DC] text-[#B85228] border border-[#E8D8C4]">
                              {p.paymentMethod}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#8B7355] font-medium pt-1 border-t border-[#E8D8C4]/50">
                            <div>
                              <span>Receipt: </span>
                              <span className="font-bold text-[#2F2925]">{p.receiptNo || "—"}</span>
                            </div>
                            <div className="text-right">
                              <span>Date: </span>
                              <span className="font-bold text-[#2F2925]">
                                {new Date(p.paidAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          {p.transactionId && (
                            <div className="text-[10px] text-[#8B7355]">
                              Ref/UTR: <span className="font-mono text-[#2F2925]">{p.transactionId}</span>
                            </div>
                          )}

                          {p.notes && (
                            <div className="text-[11px] text-[#5A4A3A] italic bg-[#FDF0DC]/30 p-1.5 rounded-lg">
                              "{p.notes}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: EDIT REVISIONS AUDIT LOG */}
              {historyTab === "EDITS" && (
                <div className="space-y-3">
                  {(!selectedFee.editHistory || selectedFee.editHistory.length === 0) ? (
                    <div className="py-8 text-center text-xs text-[#8B7355] space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600/70 mx-auto mb-1.5" />
                      <p className="font-bold text-[#2F2925]">Original Unaltered Invoice</p>
                      <p className="text-[11px] text-[#8B7355]">
                        No adjustments have been made to this invoice since creation on{" "}
                        {new Date(selectedFee.createdAt).toLocaleDateString("en-IN")}.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#2F2925]">
                          Financial Audit Trail ({selectedFee.editHistory.length} revision{selectedFee.editHistory.length > 1 ? "s" : ""})
                        </span>
                        <span className="text-[10px] text-[#8B7355]">Preserved for audit compliance</span>
                      </div>

                      {[...selectedFee.editHistory].reverse().map((rev, rIdx) => (
                        <div
                          key={rev._id || rIdx}
                          className="p-3.5 bg-white border border-[#E8D8C4] rounded-xl space-y-2 shadow-2xs hover:border-[#EB8055]/50 transition-colors"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-extrabold text-[#2F2925] flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500" />
                              Revision #{selectedFee.editHistory.length - rIdx}
                            </span>
                            <span className="text-[10px] text-[#8B7355] font-semibold">
                              {new Date(rev.editedAt).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <div className="text-[11px] text-[#5A4A3A] bg-[#FDF0DC]/50 border border-[#E8D8C4]/60 p-2 rounded-lg">
                            <span className="font-bold text-[#2F2925]">Reason for Edit: </span>
                            <span className="italic font-medium">"{rev.reason || "Invoice details modified"}"</span>
                            <span className="text-[10px] text-[#8B7355] block mt-0.5">
                              Authorized by: <strong className="text-[#2F2925]">{rev.editorName || "Hostel Administrator"}</strong>
                            </span>
                          </div>

                          {rev.changes && rev.changes.length > 0 && (
                            <div className="space-y-1.5 pt-1 border-t border-[#E8D8C4]/50">
                              <span className="text-[10px] font-bold text-[#8B7355] uppercase tracking-wider block">
                                Changes Made:
                              </span>
                              <div className="space-y-1">
                                {rev.changes.map((c, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className="flex items-center justify-between text-xs p-1.5 bg-[#FDF0DC]/20 border border-[#E8D8C4]/60 rounded-lg"
                                  >
                                    <span className="font-bold text-[#2F2925]">{c.fieldLabel || c.field}</span>
                                    <div className="flex items-center gap-1.5 text-[11px]">
                                      <span className="text-rose-700 line-through font-medium">{String(c.oldVal)}</span>
                                      <ArrowRight className="w-3 h-3 text-[#8B7355]" />
                                      <span className="text-emerald-700 font-extrabold">{String(c.newVal)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E8D8C4] flex justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT INVOICE */}
      {isEditModalOpen && selectedFee && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-[#E8D8C4]">
            <div className="flex items-center justify-between border-b border-[#E8D8C4] px-6 py-4">
              <div>
                <h3 className="text-base font-extrabold text-[#2F2925] flex items-center gap-2">
                  <Edit2 className="w-5 h-5 text-[#EB8055]" />
                  Revise Fee Invoice
                </h3>
                <p className="text-[11px] text-[#8B7355] mt-0.5">
                  Edits are permanently logged in the audit trail for financial transparency.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateFee} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Student Roll No</label>
                <input
                  type="text"
                  disabled
                  value={selectedFee.studentRollno}
                  className="w-full bg-slate-100 border border-[#E8D8C4] rounded-xl p-2.5 font-bold uppercase text-[#8B7355] cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Fee Type</label>
                  <select
                    value={editForm.feeType}
                    onChange={(e) => setEditForm({ ...editForm, feeType: e.target.value })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                  >
                    <option value="Hostel Fee">Hostel Fee</option>
                    <option value="Mess Fee">Mess Fee</option>
                    <option value="Maintenance Fee">Maintenance Fee</option>
                    <option value="Caution Deposit">Caution Deposit</option>
                    <option value="Electricity / Utility">Electricity / Utility</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Total Amount (₹) *</label>
                  <input
                    type="number"
                    min={selectedFee.paidAmount || 1}
                    required
                    value={editForm.totalAmount}
                    onChange={(e) => setEditForm({ ...editForm, totalAmount: e.target.value })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-bold text-[#2F2925]"
                  />
                  {selectedFee.paidAmount > 0 && (
                    <span className="text-[10px] text-[#8B7355] mt-0.5 block">
                      Min: ₹{selectedFee.paidAmount} (already paid)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={editForm.academicYear}
                    onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                  />
                </div>

                <div>
                  <label className="block text-[#2F2925] mb-1 font-bold">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={editForm.dueDate}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">Remarks</label>
                <textarea
                  rows="2"
                  value={editForm.remarks}
                  onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                  className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                />
              </div>

              <div>
                <label className="block text-[#2F2925] mb-1 font-bold">
                  Reason for Revision / Audit Note *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adjusted monthly mess charge, extended due date, fee waiver"
                  value={editForm.editReason}
                  onChange={(e) => setEditForm({ ...editForm, editReason: e.target.value })}
                  className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                />
                <span className="text-[10px] text-[#8B7355] mt-1 block">
                  This note will be saved in the permanent audit history for this student.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8D8C4]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving Revision..." : "Save Revision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: BULK FEE MANAGEMENT & BATCH REVISION */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2F2925]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-[#E8D8C4] max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E8D8C4] px-6 py-4 bg-[#FDF0DC]/40">
              <div>
                <h3 className="text-base font-extrabold text-[#2F2925] flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#EB8055]" />
                  Bulk Fee Management & Batch Revision
                </h3>
                <p className="text-[11px] text-[#8B7355] mt-0.5">
                  Revise amounts, extend due dates, or void unpaid invoices across multiple students at once.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="text-[#8B7355] hover:text-[#2F2925] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-6 space-y-4 overflow-y-auto text-xs font-semibold">
              {/* SCOPE SELECTION TABS */}
              <div>
                <label className="block text-[#2F2925] mb-1.5 font-bold">1. Select Target Invoices</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#FDF0DC]/50 rounded-xl border border-[#E8D8C4]">
                  <button
                    type="button"
                    onClick={() => setBulkScope("SELECTED")}
                    disabled={selectedFeeIds.length === 0}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      bulkScope === "SELECTED"
                        ? "bg-white text-[#2F2925] shadow-xs border border-[#E8D8C4]"
                        : "text-[#8B7355] hover:text-[#2F2925] disabled:opacity-40 disabled:cursor-not-allowed"
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-[#EB8055]" />
                    <span>Selected Invoices ({selectedFeeIds.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkScope("BATCH")}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      bulkScope === "BATCH"
                        ? "bg-white text-[#2F2925] shadow-xs border border-[#E8D8C4]"
                        : "text-[#8B7355] hover:text-[#2F2925]"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-[#EB8055]" />
                    <span>Batch Criteria (All / Block)</span>
                  </button>
                </div>
              </div>

              {/* SCOPE DETAILS CONTAINER */}
              {bulkScope === "SELECTED" ? (
                <div className="p-3 bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#2F2925]">
                      {selectedFeeIds.length} invoice(s) selected from table
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFeeIds([]);
                        setBulkScope("BATCH");
                      }}
                      className="text-[10px] text-[#EB8055] hover:underline cursor-pointer font-bold"
                    >
                      Clear & switch to Batch
                    </button>
                  </div>

                  {/* Selected Roll Number Tags */}
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {fees
                      .filter((f) => selectedFeeIds.includes(f._id))
                      .slice(0, 12)
                      .map((f) => (
                        <span
                          key={f._id}
                          className="px-2 py-0.5 bg-white border border-[#E8D8C4] rounded text-[10px] text-[#2F2925] font-bold"
                        >
                          {f.studentRollno} ({f.feeType?.slice(0, 4)}: ₹{f.totalAmount})
                        </span>
                      ))}
                    {selectedFeeIds.length > 12 && (
                      <span className="px-2 py-0.5 bg-[#EB8055]/10 text-[#EB8055] rounded text-[10px] font-extrabold">
                        +{selectedFeeIds.length - 12} more
                      </span>
                    )}
                  </div>

                  {/* Selected composition stats */}
                  {(() => {
                    const selFees = fees.filter((f) => selectedFeeIds.includes(f._id));
                    const selUnpaid = selFees.filter(
                      (f) => (!f.paidAmount || f.paidAmount === 0) && (!f.payments || f.payments.length === 0)
                    ).length;
                    const selWithPay = selFees.length - selUnpaid;
                    return (
                      <div className="text-[10px] text-[#8B7355] flex items-center gap-3 pt-1 border-t border-[#E8D8C4]/60">
                        <span>Unpaid (₹0 paid): <strong className="text-[#2F2925]">{selUnpaid}</strong></span>
                        <span>Has Payments: <strong className="text-emerald-700">{selWithPay}</strong></span>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="p-3 bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#2F2925] mb-1 font-bold">Target Audience</label>
                      <select
                        value={bulkForm.targetType}
                        onChange={(e) => setBulkForm({ ...bulkForm, targetType: e.target.value })}
                        className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2 font-semibold text-[#2F2925] outline-none focus:border-[#EB8055]"
                      >
                        <option value="ALL">All Active Students ({activeStudents.length})</option>
                        <option value="BLOCK">By Specific Block</option>
                      </select>
                    </div>

                    {bulkForm.targetType === "BLOCK" ? (
                      <div>
                        <label className="block text-[#2F2925] mb-1 font-bold">Select Block</label>
                        <select
                          value={bulkForm.targetBlock}
                          onChange={(e) => setBulkForm({ ...bulkForm, targetBlock: e.target.value })}
                          className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2 font-semibold text-[#2F2925] outline-none focus:border-[#EB8055]"
                        >
                          <option value="D">Block D ({getActiveStudentsInBlock("D").length} active)</option>
                          <option value="A">Block A ({getActiveStudentsInBlock("A").length} active)</option>
                          <option value="B">Block B ({getActiveStudentsInBlock("B").length} active)</option>
                          <option value="C">Block C ({getActiveStudentsInBlock("C").length} active)</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[#2F2925] mb-1 font-bold">Academic Year</label>
                        <select
                          value={bulkForm.academicYear}
                          onChange={(e) => setBulkForm({ ...bulkForm, academicYear: e.target.value })}
                          className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2 font-semibold text-[#2F2925] outline-none focus:border-[#EB8055]"
                        >
                          <option value="2025-2026">2025-2026</option>
                          <option value="2024-2025">2024-2025</option>
                          <option value="2026-2027">2026-2027</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#2F2925] mb-1 font-bold">Fee Category</label>
                      <select
                        value={bulkForm.feeType}
                        onChange={(e) => setBulkForm({ ...bulkForm, feeType: e.target.value })}
                        className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2 font-semibold text-[#2F2925] outline-none focus:border-[#EB8055]"
                      >
                        <option value="Mess Fee">Mess Fee</option>
                        <option value="Hostel Fee">Hostel Fee</option>
                        <option value="Maintenance Fee">Maintenance Fee</option>
                        <option value="Caution Deposit">Caution Deposit</option>
                        <option value="Electricity / Utility">Electricity / Utility</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#2F2925] mb-1 font-bold">Billing Term</label>
                      <input
                        type="text"
                        value={bulkForm.term}
                        onChange={(e) => setBulkForm({ ...bulkForm, term: e.target.value })}
                        placeholder="e.g. October 2026 or Semester 1"
                        className="w-full bg-white border border-[#E8D8C4] rounded-xl p-2 font-semibold text-[#2F2925] outline-none focus:border-[#EB8055]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION MODE SELECTOR (ADJUST VS VOID) */}
              <div>
                <label className="block text-[#2F2925] mb-1.5 font-bold">2. Choose Action</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#FDF0DC]/50 rounded-xl border border-[#E8D8C4]">
                  <button
                    type="button"
                    onClick={() => setBulkAction("ADJUST")}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      bulkAction === "ADJUST"
                        ? "bg-[#EB8055] text-white shadow-xs"
                        : "text-[#8B7355] hover:text-[#2F2925]"
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Adjust / Reduce Invoices</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkAction("VOID")}
                    className={`py-2 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      bulkAction === "VOID"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-[#8B7355] hover:text-rose-700"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Void Unpaid Invoices</span>
                  </button>
                </div>
              </div>

              {/* BODY DEPENDING ON BULK ACTION */}
              {bulkAction === "ADJUST" ? (
                <div className="space-y-3 pt-1">
                  {/* Adjustment Type Picker */}
                  <div>
                    <label className="block text-[#2F2925] mb-1 font-bold">Amount Adjustment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          bulkForm.adjustmentType === "REDUCE_BY"
                            ? "bg-[#FDF0DC]/60 border-[#EB8055] text-[#2F2925]"
                            : "bg-white border-[#E8D8C4] text-[#8B7355]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="adjustmentType"
                          value="REDUCE_BY"
                          checked={bulkForm.adjustmentType === "REDUCE_BY"}
                          onChange={(e) => setBulkForm({ ...bulkForm, adjustmentType: e.target.value })}
                          className="accent-[#EB8055]"
                        />
                        <span className="font-bold text-xs">Reduce Amount by (₹)</span>
                      </label>

                      <label
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          bulkForm.adjustmentType === "SET_TOTAL"
                            ? "bg-[#FDF0DC]/60 border-[#EB8055] text-[#2F2925]"
                            : "bg-white border-[#E8D8C4] text-[#8B7355]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="adjustmentType"
                          value="SET_TOTAL"
                          checked={bulkForm.adjustmentType === "SET_TOTAL"}
                          onChange={(e) => setBulkForm({ ...bulkForm, adjustmentType: e.target.value })}
                          className="accent-[#EB8055]"
                        />
                        <span className="font-bold text-xs">Set New Fixed Total (₹)</span>
                      </label>
                    </div>
                  </div>

                  {/* Amount & Due Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#2F2925] mb-1 font-bold">
                        {bulkForm.adjustmentType === "REDUCE_BY" ? "Reduction Amount (₹)" : "New Total Amount (₹)"}
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 500"
                        value={bulkForm.amount}
                        onChange={(e) => setBulkForm({ ...bulkForm, amount: e.target.value })}
                        className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-bold text-[#2F2925]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#2F2925] mb-1 font-bold">New Due Date (Optional)</label>
                      <input
                        type="date"
                        value={bulkForm.newDueDate}
                        onChange={(e) => setBulkForm({ ...bulkForm, newDueDate: e.target.value })}
                        className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                      />
                    </div>
                  </div>

                  {/* Remarks */}
                  <div>
                    <label className="block text-[#2F2925] mb-1 font-bold">Updated Remarks / Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Adjusted as per hostel council notification"
                      value={bulkForm.remarks}
                      onChange={(e) => setBulkForm({ ...bulkForm, remarks: e.target.value })}
                      className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                    />
                  </div>

                  {/* Mandatory Reason for Revision */}
                  <div>
                    <label className="block text-[#2F2925] mb-1 font-bold">
                      Reason for Bulk Revision / Audit Trail *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Warden sanctioned mess discount, annual fee correction"
                      value={bulkForm.editReason}
                      onChange={(e) => setBulkForm({ ...bulkForm, editReason: e.target.value })}
                      className="w-full bg-[#FDF0DC]/30 border border-[#E8D8C4] rounded-xl p-2.5 outline-none focus:border-[#EB8055] font-medium text-[#2F2925]"
                    />
                    <span className="text-[10px] text-[#8B7355] mt-1 block">
                      This explanation will be permanently recorded in each invoice&apos;s revision history with your admin ID.
                    </span>
                  </div>

                  {/* Safeguard Alert Notice */}
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                      <strong>Financial Protection Guard:</strong> If any student has already paid more than the reduced amount, their invoice total will be safely capped at their paid amount to prevent negative balances.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  {/* VOID WARNING */}
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Financial Accounting & Audit Safeguard Active</span>
                    </div>
                    <p className="text-[11px] text-rose-700 font-medium leading-relaxed">
                      Only invoices with <strong>₹0 paid</strong> and <strong>0 payment transactions</strong> will be permanently voided. Any student invoices with recorded payments will be <strong>strictly preserved</strong> to protect accounting audit trails.
                    </p>
                  </div>

                  <p className="text-xs text-[#8B7355]">
                    {bulkScope === "SELECTED"
                      ? `You are about to void unpaid invoices among the ${selectedFeeIds.length} selected record(s).`
                      : `You are about to void unpaid batch invoices for ${bulkForm.feeType} (${bulkForm.term}).`}
                  </p>
                </div>
              )}

              {/* MODAL FOOTER */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8D8C4]">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#FDF0DC]/50 border border-[#E8D8C4] text-[#2F2925] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                    bulkAction === "VOID"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-[#EB8055] hover:bg-[#D96B3A]"
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : bulkAction === "VOID" ? (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirm & Void Unpaid</span>
                    </>
                  ) : (
                    <>
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Apply Bulk Revision</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
