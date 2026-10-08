const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["Student", "Admin"],
      default: "Student",
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
    },
    resetPasswordOTP: String,
    resetPasswordExpires: Date,
    refreshTokens: [String],
  },
  {
    timestamps: true,
  }
);

userSchema.index({ student: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);
