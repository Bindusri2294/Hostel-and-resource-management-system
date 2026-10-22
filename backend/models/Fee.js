const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["Online / UPI", "Cash", "Bank Transfer", "Cheque", "Demand Draft", "Other"],
      default: "Online / UPI",
    },
    transactionId: {
      type: String,
      trim: true,
      default: "",
    },
    receiptNo: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: true }
);

const editChangeSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    fieldLabel: { type: String, required: true },
    oldVal: { type: mongoose.Schema.Types.Mixed },
    newVal: { type: mongoose.Schema.Types.Mixed },
  },
  { _id: false }
);

const editHistorySchema = new mongoose.Schema(
  {
    editedAt: {
      type: Date,
      default: Date.now,
    },
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    editorName: {
      type: String,
      default: "Admin",
    },
    reason: {
      type: String,
      trim: true,
      default: "Invoice details updated",
    },
    changes: [editChangeSchema],
  },
  { _id: true }
);

const feeSchema = new mongoose.Schema(
  {
    studentRollno: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    feeType: {
      type: String,
      required: true,
      enum: [
        "Hostel Fee",
        "Mess Fee",
        "Maintenance Fee",
        "Caution Deposit",
        "Electricity / Utility",
        "Other",
      ],
      default: "Hostel Fee",
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
      default: "2025-2026",
    },
    term: {
      type: String,
      trim: true,
      default: "Full Year",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Paid", "Partially Paid", "Unpaid", "Overdue"],
      default: "Unpaid",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    payments: [paymentSchema],
    isEdited: {
      type: Boolean,
      default: false,
    },
    lastEditedAt: {
      type: Date,
    },
    editHistory: [editHistorySchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Auto compute status before saving
feeSchema.pre("save", function () {
  if (this.paidAmount >= this.totalAmount) {
    this.status = "Paid";
  } else if (this.dueDate && new Date(this.dueDate) < new Date()) {
    this.status = "Overdue";
  } else if (this.paidAmount > 0) {
    this.status = "Partially Paid";
  } else {
    this.status = "Unpaid";
  }
});

feeSchema.index({ studentRollno: 1, academicYear: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ feeType: 1 });
feeSchema.index({ dueDate: 1 });

module.exports = mongoose.models.Fee || mongoose.model("Fee", feeSchema);
