const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
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
    },
  ],
  grades: [
    {
      subject: String,
      score: Number,
    },
  ],
});
module.exports = mongoose.model("Student", studentSchema);
