const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Get all fee payments
router.get('/', auth, async (req, res) => {
  try {
    const students = await Student.find().populate('class');
    const payments = [];
    
    students.forEach(student => {
      student.feeStatus.forEach(payment => {
        payments.push({
          id: payment._id,
          studentId: student._id,
          studentName: student.name,
          className: student.class?.name || 'N/A',
          month: payment.month,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          paidBy: payment.paidBy
        });
      });
    });
    
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new fee payment
router.post('/', auth, roleAuth(['super', 'sub']), async (req, res) => {
  try {
    const { studentId, month, amount, paymentMethod } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if payment for this month already exists
    const existingPayment = student.feeStatus.find(p => p.month === month);
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment for this month already exists' });
    }

    const newPayment = {
      month,
      amount,
      paymentMethod,
      paidBy: req.admin._id
    };

    student.feeStatus.push(newPayment);
    await student.save();
    
    res.status(201).json({ message: 'Payment recorded successfully' });
  } catch (err) {
    console.error('Error recording payment:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update fee payment (only super admin)
router.put('/:studentId/:paymentId', auth, roleAuth(['super']), async (req, res) => {
  try {
    const { month, amount, paymentMethod } = req.body;
    const { studentId, paymentId } = req.params;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const payment = student.feeStatus.id(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.month = month || payment.month;
    payment.amount = amount || payment.amount;
    payment.paymentMethod = paymentMethod || payment.paymentMethod;

    await student.save();
    res.json({ message: 'Payment updated successfully' });
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete fee payment (only super admin)
router.delete('/:studentId/:paymentId', auth, roleAuth(['super']), async (req, res) => {
  try {
    const { studentId, paymentId } = req.params;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.feeStatus = student.feeStatus.filter(p => p._id.toString() !== paymentId);
    await student.save();
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error('Error deleting payment:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;