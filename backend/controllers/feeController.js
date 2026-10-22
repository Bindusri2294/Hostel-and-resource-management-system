const Fee = require("../models/Fee");
const Student = require("../models/student");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Helper to calculate status
const computeFeeStatus = (totalAmount, paidAmount, dueDate) => {
  if (Number(paidAmount) >= Number(totalAmount)) {
    return "Paid";
  }
  if (dueDate && new Date(dueDate) < new Date()) {
    return "Overdue";
  }
  if (Number(paidAmount) > 0) {
    return "Partially Paid";
  }
  return "Unpaid";
};

// 1. Admin creates a new fee entry
const createFee = async (req, res, next) => {
  try {
    const {
      studentRollno,
      feeType,
      academicYear,
      term,
      totalAmount,
      paidAmount = 0,
      dueDate,
      remarks,
      initialPaymentMethod = "Cash",
      transactionId = "",
      receiptNo = "",
    } = req.body;

    if (!studentRollno || !totalAmount || !dueDate) {
      return res.status(400).json({
        message: "Student Roll Number, Total Amount, and Due Date are required.",
      });
    }

    const cleanRollno = String(studentRollno).trim().toUpperCase();
    const parsedTotal = Math.max(0, Number(totalAmount));
    const parsedPaid = Math.max(0, Number(paidAmount || 0));

    if (parsedTotal <= 0) {
      return res.status(400).json({ message: "Total amount must be greater than zero." });
    }

    // Verify student exists or link student _id if found
    const student = await Student.findOne({
      Rollno: { $regex: new RegExp(`^${cleanRollno}$`, "i") },
    });

    const payments = [];
    if (parsedPaid > 0) {
      payments.push({
        amount: parsedPaid,
        paidAt: new Date(),
        paymentMethod: initialPaymentMethod || "Cash",
        transactionId: transactionId || "",
        receiptNo: receiptNo || `RCP-${Date.now().toString().slice(-6)}`,
        notes: "Initial payment recorded during invoice generation",
        recordedBy: req.user?._id,
      });
    }

    const status = computeFeeStatus(parsedTotal, parsedPaid, dueDate);

    const fee = await Fee.create({
      studentRollno: cleanRollno,
      student: student ? student._id : undefined,
      feeType: feeType || "Hostel Fee",
      academicYear: academicYear || "2025-2026",
      term: term || "Full Year",
      totalAmount: parsedTotal,
      paidAmount: parsedPaid,
      dueDate: new Date(dueDate),
      status,
      remarks: remarks || "",
      payments,
      createdBy: req.user?._id,
    });

    // Notify student in-app
    try {
      await Notification.create({
        title: `New Fee Invoice: ${fee.feeType}`,
        message: `An invoice of ₹${parsedTotal.toLocaleString("en-IN")} for ${fee.feeType} (${fee.academicYear}) has been generated. Due date: ${new Date(dueDate).toLocaleDateString("en-IN")}.`,
        targetType: "SINGLE_STUDENT",
        targetValue: cleanRollno,
        sender: req.user._id,
      });
    } catch (notifErr) {
      console.warn("Could not dispatch fee notification:", notifErr.message);
    }

    res.status(201).json({
      message: "Fee record created successfully.",
      fee,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Admin gets all fees with stats and filtering
const getAllFees = async (req, res, next) => {
  try {
    const { status, feeType, academicYear, search } = req.query;

    const query = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (feeType && feeType !== "All") {
      query.feeType = feeType;
    }

    if (academicYear && academicYear !== "All") {
      query.academicYear = academicYear;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { studentRollno: { $regex: q, $options: "i" } },
        { remarks: { $regex: q, $options: "i" } },
      ];
    }

    const fees = await Fee.find(query)
      .populate("student", "Rollno Roomno Block Course Department")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Check for any overdue records dynamically and sync status if needed
    const now = new Date();
    const updatedFees = fees.map((f) => {
      let currentStatus = f.status;
      if (f.paidAmount < f.totalAmount && new Date(f.dueDate) < now) {
        currentStatus = "Overdue";
      } else if (f.paidAmount >= f.totalAmount) {
        currentStatus = "Paid";
      } else if (f.paidAmount > 0) {
        currentStatus = "Partially Paid";
      } else {
        currentStatus = "Unpaid";
      }
      return { ...f, status: currentStatus };
    });

    // Compute aggregate statistics
    const allRecords = await Fee.find({}).lean();
    let totalBilled = 0;
    let totalCollected = 0;
    let overdueCount = 0;
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;

    allRecords.forEach((f) => {
      totalBilled += Number(f.totalAmount || 0);
      totalCollected += Number(f.paidAmount || 0);

      const isOverdue = f.paidAmount < f.totalAmount && new Date(f.dueDate) < now;
      if (f.paidAmount >= f.totalAmount) {
        paidCount++;
      } else if (isOverdue) {
        overdueCount++;
      } else if (f.paidAmount > 0) {
        partialCount++;
      } else {
        unpaidCount++;
      }
    });

    res.status(200).json({
      fees: updatedFees,
      stats: {
        totalRecords: allRecords.length,
        totalBilled,
        totalCollected,
        totalPending: Math.max(0, totalBilled - totalCollected),
        paidCount,
        overdueCount,
        partialCount,
        unpaidCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 3. Student views their own fees
const getMyFees = async (req, res, next) => {
  try {
    let studentRollno = req.user.student?.Rollno;
    let studentObjId = req.user.student?._id;

    if (!studentRollno) {
      const userDoc = await User.findById(req.user._id).populate("student");
      studentRollno = userDoc?.student?.Rollno;
      studentObjId = userDoc?.student?._id;
    }

    if (!studentRollno && !studentObjId) {
      return res.status(200).json({
        fees: [],
        stats: {
          totalBilled: 0,
          totalPaid: 0,
          totalDue: 0,
          overdueCount: 0,
        },
      });
    }

    const query = {
      $or: [],
    };
    if (studentRollno) {
      query.$or.push({ studentRollno: { $regex: new RegExp(`^${studentRollno}$`, "i") } });
    }
    if (studentObjId) {
      query.$or.push({ student: studentObjId });
    }

    const fees = await Fee.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    let totalBilled = 0;
    let totalPaid = 0;
    let overdueCount = 0;

    const formattedFees = fees.map((f) => {
      totalBilled += Number(f.totalAmount || 0);
      totalPaid += Number(f.paidAmount || 0);

      let currentStatus = f.status;
      if (f.paidAmount < f.totalAmount && new Date(f.dueDate) < now) {
        currentStatus = "Overdue";
        overdueCount++;
      } else if (f.paidAmount >= f.totalAmount) {
        currentStatus = "Paid";
      } else if (f.paidAmount > 0) {
        currentStatus = "Partially Paid";
      } else {
        currentStatus = "Unpaid";
      }

      return {
        ...f,
        status: currentStatus,
        balance: Math.max(0, (f.totalAmount || 0) - (f.paidAmount || 0)),
      };
    });

    res.status(200).json({
      fees: formattedFees,
      stats: {
        totalBilled,
        totalPaid,
        totalDue: Math.max(0, totalBilled - totalPaid),
        overdueCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 4. Admin records a payment against a fee entry
const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, transactionId, receiptNo, notes } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Valid payment amount is required." });
    }

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found." });
    }

    const remainingDue = Math.max(0, fee.totalAmount - fee.paidAmount);
    if (parsedAmount > remainingDue) {
      return res.status(400).json({
        message: `Payment amount (₹${parsedAmount}) exceeds outstanding balance (₹${remainingDue}).`,
      });
    }

    const generatedReceipt = receiptNo || `RCP-${Date.now().toString().slice(-6)}`;

    const newPayment = {
      amount: parsedAmount,
      paidAt: new Date(),
      paymentMethod: paymentMethod || "Online / UPI",
      transactionId: transactionId || "",
      receiptNo: generatedReceipt,
      notes: notes || "",
      recordedBy: req.user?._id,
    };

    fee.payments.push(newPayment);
    fee.paidAmount = (fee.paidAmount || 0) + parsedAmount;
    fee.status = computeFeeStatus(fee.totalAmount, fee.paidAmount, fee.dueDate);

    await fee.save();

    // Send confirmation notification to student
    try {
      await Notification.create({
        title: `Payment Received: ₹${parsedAmount.toLocaleString("en-IN")}`,
        message: `Your payment of ₹${parsedAmount.toLocaleString("en-IN")} for ${fee.feeType} (${fee.academicYear}) has been recorded. Receipt: ${generatedReceipt}.`,
        targetType: "SINGLE_STUDENT",
        targetValue: fee.studentRollno,
        sender: req.user._id,
      });
    } catch (notifErr) {
      console.warn("Could not dispatch payment confirmation notification:", notifErr.message);
    }

    res.status(200).json({
      message: `Payment of ₹${parsedAmount.toLocaleString("en-IN")} recorded successfully.`,
      fee,
      payment: newPayment,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Admin updates fee details with full audit tracking
const updateFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { feeType, academicYear, term, totalAmount, dueDate, remarks, editReason } = req.body;

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found." });
    }

    const changes = [];

    if (totalAmount !== undefined) {
      const parsedTotal = Number(totalAmount);
      if (parsedTotal < fee.paidAmount) {
        return res.status(400).json({
          message: `Total amount cannot be less than already paid amount (₹${fee.paidAmount}).`,
        });
      }
      if (parsedTotal !== fee.totalAmount) {
        changes.push({
          field: "totalAmount",
          fieldLabel: "Total Billed Amount",
          oldVal: `₹${Number(fee.totalAmount || 0).toLocaleString("en-IN")}`,
          newVal: `₹${parsedTotal.toLocaleString("en-IN")}`,
        });
        fee.totalAmount = parsedTotal;
      }
    }

    if (feeType && feeType !== fee.feeType) {
      changes.push({
        field: "feeType",
        fieldLabel: "Fee Category",
        oldVal: fee.feeType,
        newVal: feeType,
      });
      fee.feeType = feeType;
    }

    if (academicYear && academicYear !== fee.academicYear) {
      changes.push({
        field: "academicYear",
        fieldLabel: "Academic Year",
        oldVal: fee.academicYear,
        newVal: academicYear,
      });
      fee.academicYear = academicYear;
    }

    if (term && term !== (fee.term || "")) {
      changes.push({
        field: "term",
        fieldLabel: "Billing Term",
        oldVal: fee.term || "Full Year",
        newVal: term,
      });
      fee.term = term;
    }

    if (dueDate) {
      const newDueDateObj = new Date(dueDate);
      const oldDueDateStr = fee.dueDate ? new Date(fee.dueDate).toISOString().slice(0, 10) : "";
      const newDueDateStr = newDueDateObj.toISOString().slice(0, 10);
      if (oldDueDateStr !== newDueDateStr) {
        changes.push({
          field: "dueDate",
          fieldLabel: "Payment Due Date",
          oldVal: fee.dueDate ? new Date(fee.dueDate).toLocaleDateString("en-IN") : "None",
          newVal: newDueDateObj.toLocaleDateString("en-IN"),
        });
        fee.dueDate = newDueDateObj;
      }
    }

    if (remarks !== undefined && remarks !== (fee.remarks || "")) {
      changes.push({
        field: "remarks",
        fieldLabel: "Remarks / Notes",
        oldVal: fee.remarks || "None",
        newVal: remarks || "None",
      });
      fee.remarks = remarks;
    }

    // If any changes occurred, append to audit editHistory
    if (changes.length > 0) {
      const editorName =
        req.user?.name ||
        req.user?.email ||
        (req.user?.role === "Admin" ? "Hostel Administrator" : "Admin");

      fee.editHistory = fee.editHistory || [];
      fee.editHistory.push({
        editedAt: new Date(),
        editedBy: req.user?._id,
        editorName,
        reason: editReason?.trim() || "Administrative invoice adjustment",
        changes,
      });
      fee.isEdited = true;
      fee.lastEditedAt = new Date();
    }

    fee.status = computeFeeStatus(fee.totalAmount, fee.paidAmount, fee.dueDate);
    await fee.save();

    res.status(200).json({
      message: changes.length > 0
        ? "Fee record updated and audit log recorded."
        : "No changes detected. Fee record left unmodified.",
      fee,
    });
  } catch (error) {
    next(error);
  }
};

// 6. Admin deletes a fee record (Protected for financial audit integrity)
const deleteFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const fee = await Fee.findById(id);

    if (!fee) {
      return res.status(404).json({ message: "Fee record not found." });
    }

    // Financial audit protection: invoices with recorded payments can NEVER be deleted
    if (fee.payments && fee.payments.length > 0) {
      return res.status(400).json({
        message:
          "Financial audit protection: Fee invoices with recorded payments cannot be deleted. Please use 'Edit Invoice' if an adjustment is required.",
      });
    }

    // Invoices are critical financial ledger records — permanent deletion is disabled
    return res.status(403).json({
      message:
        "Permanent deletion of fee records is disabled to protect financial audit trails. Please use 'Edit Invoice' to modify details or adjust totals.",
    });
  } catch (error) {
    next(error);
  }
};

// 7. Admin creates batch/bulk fee invoices (e.g. Monthly Mess Fee for All Students or by Block)
const createBatchFees = async (req, res, next) => {
  try {
    const {
      targetType = "ALL", // "ALL" | "BLOCK"
      targetBlock = "",
      feeType = "Mess Fee",
      academicYear = "2025-2026",
      term = "Full Year",
      totalAmount,
      dueDate,
      remarks,
    } = req.body;

    if (!feeType || !totalAmount || !dueDate) {
      return res.status(400).json({
        message: "Fee Type, Total Amount, and Due Date are required.",
      });
    }

    const parsedTotal = Math.max(0, Number(totalAmount));
    if (parsedTotal <= 0) {
      return res.status(400).json({ message: "Total amount must be greater than zero." });
    }

    // Filter active students only
    const filter = { Status: { $regex: /^active$/i } };
    if (targetType === "BLOCK" && targetBlock) {
      filter.Block = targetBlock;
    }

    const students = await Student.find(filter).select("Rollno Name Block Roomno Status").lean();

    if (!students || students.length === 0) {
      return res.status(404).json({
        message:
          targetType === "BLOCK"
            ? `No active students found in Block ${targetBlock}.`
            : "No active students found in the hostel.",
      });
    }

    // Check for existing invoices with the same feeType, academicYear, and term to prevent duplicate billing
    const existing = await Fee.find({
      feeType,
      academicYear,
      term,
      studentRollno: { $in: students.map((s) => s.Rollno.toUpperCase()) },
    })
      .select("studentRollno")
      .lean();

    const existingSet = new Set(existing.map((e) => e.studentRollno.toUpperCase()));
    const eligibleStudents = students
      .filter((s) => s.Rollno && String(s.Rollno).trim().length > 0)
      .filter((s) => !existingSet.has(String(s.Rollno).trim().toUpperCase()));

    if (eligibleStudents.length === 0) {
      return res.status(400).json({
        message: `All matching students already have an active invoice for ${feeType} - ${term} (${academicYear}).`,
      });
    }

    const dueDateObj = new Date(dueDate);
    const initialStatus = dueDateObj < new Date() ? "Overdue" : "Unpaid";

    const feeDocs = eligibleStudents.map((s) => ({
      studentRollno: String(s.Rollno).trim().toUpperCase(),
      student: s._id,
      feeType,
      academicYear,
      term,
      totalAmount: parsedTotal,
      paidAmount: 0,
      dueDate: dueDateObj,
      status: initialStatus,
      remarks: remarks || `Batch invoice for ${term}`,
      payments: [],
      createdBy: req.user?._id,
    }));

    const inserted = await Fee.insertMany(feeDocs, { ordered: false });

    // Notify students in-app
    try {
      if (req.user?._id) {
        await Notification.create({
          title: `New Fee Invoice: ${feeType} (${term})`,
          message: `A new invoice of ₹${parsedTotal.toLocaleString("en-IN")} for ${feeType} (${term}, ${academicYear}) has been generated. Due date: ${dueDateObj.toLocaleDateString("en-IN")}.`,
          targetType: targetType === "BLOCK" ? "BLOCK" : "ALL",
          targetValue: targetType === "BLOCK" ? `Block ${targetBlock}` : "",
          sender: req.user._id,
        });
      }
    } catch (notifErr) {
      console.warn("Could not dispatch bulk fee notification:", notifErr.message);
    }

    res.status(201).json({
      message: `Successfully generated ${inserted.length} fee invoice(s)${
        existing.length > 0 ? ` (${existing.length} already existed and were skipped)` : ""
      }.`,
      count: inserted.length,
      skipped: existing.length,
    });
  } catch (error) {
    console.error("Batch fee creation error:", error);
    next(error);
  }
};

// 8. Student self-pays an invoice directly via Student Portal
const studentPayFee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod = "Online / UPI", transactionId } = req.body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return res.status(400).json({ message: "Valid payment amount is required." });
    }

    // Locate linked student record for the authenticated user
    let studentRollno = req.user.student?.Rollno;
    let studentObjId = req.user.student?._id;
    if (!studentRollno) {
      const userDoc = await User.findById(req.user._id).populate("student");
      studentRollno = userDoc?.student?.Rollno;
      studentObjId = userDoc?.student?._id;
    }

    const fee = await Fee.findById(id);
    if (!fee) {
      return res.status(404).json({ message: "Fee invoice not found." });
    }

    // Verify ownership (unless Admin)
    if (req.user.role !== "Admin") {
      const matchRoll =
        studentRollno && fee.studentRollno && fee.studentRollno.toUpperCase() === studentRollno.toUpperCase();
      const matchId =
        studentObjId && fee.student && fee.student.toString() === studentObjId.toString();

      if (!matchRoll && !matchId) {
        return res.status(403).json({ message: "You are not authorized to pay for this invoice." });
      }
    }

    const remainingDue = Math.max(0, fee.totalAmount - (fee.paidAmount || 0));
    if (parsedAmount > remainingDue) {
      return res.status(400).json({
        message: `Payment amount (₹${parsedAmount.toLocaleString("en-IN")}) exceeds outstanding balance of ₹${remainingDue.toLocaleString("en-IN")}.`,
      });
    }

    const generatedReceipt = `RCP-${Date.now().toString().slice(-6)}`;
    const prefix = paymentMethod.includes("Card") ? "CRD" : paymentMethod.includes("Bank") ? "NB" : "UPI";
    const generatedTxn = transactionId || `TXN-${prefix}-${Date.now().toString().slice(-8)}`;

    const newPayment = {
      amount: parsedAmount,
      paidAt: new Date(),
      paymentMethod: paymentMethod || "Online / UPI",
      transactionId: generatedTxn,
      receiptNo: generatedReceipt,
      notes: "Paid directly by student via Student Portal Checkout",
      recordedBy: req.user._id,
    };

    fee.payments.push(newPayment);
    fee.paidAmount = (fee.paidAmount || 0) + parsedAmount;
    fee.status = computeFeeStatus(fee.totalAmount, fee.paidAmount, fee.dueDate);
    await fee.save();

    // Create confirmation in-app notification
    try {
      await Notification.create({
        title: `Payment Successful: ₹${parsedAmount.toLocaleString("en-IN")}`,
        message: `Your payment of ₹${parsedAmount.toLocaleString("en-IN")} for ${fee.feeType} (${fee.term || fee.academicYear}) has been recorded. Receipt: ${generatedReceipt}.`,
        targetType: "SINGLE_STUDENT",
        targetValue: fee.studentRollno,
        sender: req.user._id,
      });
    } catch (notifErr) {
      console.warn("Could not dispatch student payment notification:", notifErr.message);
    }

    res.status(200).json({
      message: `Payment of ₹${parsedAmount.toLocaleString("en-IN")} processed successfully.`,
      fee,
      payment: newPayment,
    });
  } catch (error) {
    next(error);
  }
};

// 9. Admin bulk adjusts/reduces fees across a batch or selected invoices
const bulkAdjustFees = async (req, res, next) => {
  try {
    const {
      feeIds, // optional array of specific _id strings
      feeType,
      academicYear,
      term,
      targetType = "ALL", // "ALL" | "BLOCK"
      targetBlock = "",
      adjustmentType = "SET_TOTAL", // "SET_TOTAL" | "REDUCE_BY"
      amount, // new total OR amount to reduce
      newDueDate,
      remarks,
      editReason, // required audit note
    } = req.body;

    if (!editReason || !editReason.trim()) {
      return res.status(400).json({
        message: "A clear reason for bulk revision / audit note is required.",
      });
    }

    let query = {};
    if (Array.isArray(feeIds) && feeIds.length > 0) {
      query._id = { $in: feeIds };
    } else {
      if (!feeType || !term) {
        return res.status(400).json({
          message: "Fee category and billing term are required when matching by batch criteria.",
        });
      }
      query.feeType = feeType;
      query.term = term;
      if (academicYear) query.academicYear = academicYear;

      if (targetType === "BLOCK" && targetBlock) {
        const blockStudents = await Student.find({
          Block: targetBlock,
          Status: { $regex: /^active$/i },
        })
          .select("Rollno")
          .lean();
        const rollNos = blockStudents.map((s) => s.Rollno.toUpperCase());
        query.studentRollno = { $in: rollNos };
      }
    }

    const fees = await Fee.find(query);
    if (!fees || fees.length === 0) {
      return res.status(404).json({ message: "No matching fee invoices found to adjust." });
    }

    const parsedAmount = amount !== undefined && amount !== "" ? Number(amount) : null;
    const dueDateObj = newDueDate ? new Date(newDueDate) : null;
    const editorName = req.user?.name || req.user?.email || "Hostel Administrator";

    let updatedCount = 0;
    let clampedCount = 0;

    for (const fee of fees) {
      const changes = [];
      let newTotal = fee.totalAmount;

      if (parsedAmount !== null && !isNaN(parsedAmount)) {
        if (adjustmentType === "REDUCE_BY") {
          newTotal = Math.max(0, fee.totalAmount - parsedAmount);
        } else {
          newTotal = Math.max(0, parsedAmount);
        }

        // Safeguard: Cannot set total below what the student already paid
        if (newTotal < (fee.paidAmount || 0)) {
          newTotal = fee.paidAmount;
          clampedCount++;
        }

        if (newTotal !== fee.totalAmount) {
          changes.push({
            field: "totalAmount",
            fieldLabel: "Total Billed Amount",
            oldVal: `₹${Number(fee.totalAmount || 0).toLocaleString("en-IN")}`,
            newVal: `₹${newTotal.toLocaleString("en-IN")}`,
          });
          fee.totalAmount = newTotal;
        }
      }

      if (dueDateObj) {
        const oldDueDateStr = fee.dueDate ? new Date(fee.dueDate).toISOString().slice(0, 10) : "";
        const newDueDateStr = dueDateObj.toISOString().slice(0, 10);
        if (oldDueDateStr !== newDueDateStr) {
          changes.push({
            field: "dueDate",
            fieldLabel: "Payment Due Date",
            oldVal: fee.dueDate ? new Date(fee.dueDate).toLocaleDateString("en-IN") : "None",
            newVal: dueDateObj.toLocaleDateString("en-IN"),
          });
          fee.dueDate = dueDateObj;
        }
      }

      if (remarks !== undefined && remarks !== (fee.remarks || "")) {
        changes.push({
          field: "remarks",
          fieldLabel: "Remarks / Notes",
          oldVal: fee.remarks || "None",
          newVal: remarks || "None",
        });
        fee.remarks = remarks;
      }

      if (changes.length > 0) {
        fee.editHistory = fee.editHistory || [];
        fee.editHistory.push({
          editedAt: new Date(),
          editedBy: req.user?._id,
          editorName,
          reason: `[Bulk Adjustment] ${editReason.trim()}`,
          changes,
        });
        fee.isEdited = true;
        fee.lastEditedAt = new Date();
        fee.status = computeFeeStatus(fee.totalAmount, fee.paidAmount, fee.dueDate);
        await fee.save();
        updatedCount++;
      }
    }

    // Dispatch in-app notification if batch affected
    try {
      if (updatedCount > 0 && req.user?._id) {
        await Notification.create({
          title: `Fee Revision: ${feeType || "Hostel Fee"} (${term || "Updated"})`,
          message: `Your fee invoice details have been officially revised. Reason: ${editReason.trim()}.`,
          targetType: targetType === "BLOCK" && targetBlock ? "BLOCK" : "ALL",
          targetValue: targetType === "BLOCK" && targetBlock ? `Block ${targetBlock}` : "",
          sender: req.user._id,
        });
      }
    } catch (notifErr) {
      console.warn("Could not dispatch bulk adjustment notification:", notifErr.message);
    }

    res.status(200).json({
      message: `Bulk adjustment complete. Updated ${updatedCount} invoice(s).${
        clampedCount > 0
          ? ` (${clampedCount} invoice(s) with prior payments were protected from negative balance).`
          : ""
      }`,
      updatedCount,
      clampedCount,
      totalMatched: fees.length,
    });
  } catch (error) {
    next(error);
  }
};

// 10. Admin bulk cancels/deletes unpaid invoices created in error
const bulkDeleteFees = async (req, res, next) => {
  try {
    const {
      feeIds,
      feeType,
      academicYear,
      term,
      targetType = "ALL",
      targetBlock = "",
    } = req.body;

    let query = {};
    if (Array.isArray(feeIds) && feeIds.length > 0) {
      query._id = { $in: feeIds };
    } else {
      if (!feeType || !term) {
        return res.status(400).json({
          message: "Fee category and billing term are required when matching by batch criteria.",
        });
      }
      query.feeType = feeType;
      query.term = term;
      if (academicYear) query.academicYear = academicYear;

      if (targetType === "BLOCK" && targetBlock) {
        const blockStudents = await Student.find({
          Block: targetBlock,
          Status: { $regex: /^active$/i },
        })
          .select("Rollno")
          .lean();
        const rollNos = blockStudents.map((s) => s.Rollno.toUpperCase());
        query.studentRollno = { $in: rollNos };
      }
    }

    const fees = await Fee.find(query).select("_id paidAmount payments studentRollno");
    if (!fees || fees.length === 0) {
      return res.status(404).json({ message: "No matching fee invoices found to void." });
    }

    // Safety rule: Invoices with recorded payments CANNOT be deleted
    const eligibleToDelete = [];
    const protectedInvoices = [];

    for (const f of fees) {
      const hasPayments = (f.payments && f.payments.length > 0) || (f.paidAmount && f.paidAmount > 0);
      if (hasPayments) {
        protectedInvoices.push(f._id);
      } else {
        eligibleToDelete.push(f._id);
      }
    }

    if (eligibleToDelete.length === 0) {
      return res.status(400).json({
        message: `All ${fees.length} matching invoices have recorded payments and are locked by financial audit rules. None were deleted.`,
      });
    }

    const deleteResult = await Fee.deleteMany({ _id: { $in: eligibleToDelete } });

    res.status(200).json({
      message: `Successfully voided ${deleteResult.deletedCount} unpaid invoice(s).${
        protectedInvoices.length > 0
          ? ` (${protectedInvoices.length} invoice(s) with recorded payments were preserved for accounting audit).`
          : ""
      }`,
      deletedCount: deleteResult.deletedCount,
      protectedCount: protectedInvoices.length,
      totalMatched: fees.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFee,
  createBatchFees,
  getAllFees,
  getMyFees,
  recordPayment,
  studentPayFee,
  updateFee,
  deleteFee,
  bulkAdjustFees,
  bulkDeleteFees,
};
