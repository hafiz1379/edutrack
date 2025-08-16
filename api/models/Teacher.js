// Teacher.js
const mongoose = require("mongoose"); // <-- add this line

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  contact: String,
  email: { type: String, required: true },
  gender: { type: String, enum: ["Male", "Female"], required: true },
  hireDate: { type: Date, required: true },
  degree: { type: String, required: true },
  experience: { type: Number, required: true },
  address: String,
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
  baseSalary: { type: Number, default: 0 },
  salaryPayments: [
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
      notes: String,
      status: {
        type: String,
        enum: ["Paid", "Pending", "Partial"],
        default: "Paid",
      },
    },
  ],
});

module.exports = mongoose.model("Teacher", teacherSchema);
