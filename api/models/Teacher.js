const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: { type: String, required: true },
  contact: String,
  baseSalary: { type: Number, default: 0 },
  salaryPayments: [{
    month: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Online', 'Check'], required: true },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    notes: String
  }]
});

module.exports = mongoose.model('Teacher', teacherSchema);