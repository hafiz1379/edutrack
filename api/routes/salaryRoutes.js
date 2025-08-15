const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Get all salary payments
router.get('/', auth, async (req, res) => {
  try {
    const teachers = await Teacher.find();
    const payments = [];
    
    teachers.forEach(teacher => {
      teacher.salaryPayments.forEach(payment => {
        payments.push({
          id: payment._id,
          teacherId: teacher._id,
          teacherName: teacher.name,
          subject: teacher.subject,
          baseSalary: teacher.baseSalary,
          month: payment.month,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          notes: payment.notes,
          paidBy: payment.paidBy
        });
      });
    });
    
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new salary payment
router.post('/', auth, roleAuth(['super', 'sub']), async (req, res) => {
  try {
    const { teacherId, month, amount, paymentMethod, notes } = req.body;
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if payment for this month already exists
    const existingPayment = teacher.salaryPayments.find(p => p.month === month);
    if (existingPayment) {
      return res.status(400).json({ message: 'Salary payment for this month already exists' });
    }

    const newPayment = {
      month,
      amount,
      paymentMethod,
      notes: notes || '',
      paidBy: req.admin._id
    };

    teacher.salaryPayments.push(newPayment);
    await teacher.save();
    
    res.status(201).json({ message: 'Salary payment recorded successfully' });
  } catch (err) {
    console.error('Error recording salary payment:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update salary payment (only super admin)
router.put('/:teacherId/:paymentId', auth, roleAuth(['super']), async (req, res) => {
  try {
    const { month, amount, paymentMethod, notes } = req.body;
    const { teacherId, paymentId } = req.params;
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const payment = teacher.salaryPayments.id(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Salary payment not found' });
    }

    payment.month = month || payment.month;
    payment.amount = amount || payment.amount;
    payment.paymentMethod = paymentMethod || payment.paymentMethod;
    payment.notes = notes !== undefined ? notes : payment.notes;

    await teacher.save();
    res.json({ message: 'Salary payment updated successfully' });
  } catch (err) {
    console.error('Error updating salary payment:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete salary payment (only super admin)
router.delete('/:teacherId/:paymentId', auth, roleAuth(['super']), async (req, res) => {
  try {
    const { teacherId, paymentId } = req.params;
    
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    teacher.salaryPayments = teacher.salaryPayments.filter(p => p._id.toString() !== paymentId);
    await teacher.save();
    
    res.json({ message: 'Salary payment deleted successfully' });
  } catch (err) {
    console.error('Error deleting salary payment:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;