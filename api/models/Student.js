const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
  studentId: { type: String, unique: true, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  dateOfBirth: { type: Date, required: true },
  parentContact: { type: String, required: true },
  feeStatus: [
    {
      month: { type: String, required: true },
      amount: { type: Number, required: true },
      paymentDate: { type: Date, default: Date.now },
      paymentMethod: {
        type: String,
        enum: ["Cash", "Bank Transfer", "Online", "Check"],
        required: true,
      },
      paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
      },
      receiptNo: { type: String, required: true },
      status: {
        type: String,
        enum: ["Paid", "Partial", "Debt"],
        default: "Paid",
      },
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);
