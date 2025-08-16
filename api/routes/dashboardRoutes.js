const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const auth = require('../middleware/auth');


// Get comprehensive dashboard data
router.get('/stats', auth, async (req, res) => {
  try {
    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();

    // Count totals
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await Class.countDocuments();

    // Get fee payments by month for the last 12 months
    const feePaymentsByMonth = [];
    const students = await Student.find();
    const monthlyFees = {};
    
    students.forEach(student => {
      student.feeStatus.forEach(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const monthYear = `${paymentDate.getFullYear()}-${paymentDate.getMonth() + 1}`;
        if (!monthlyFees[monthYear]) {
          monthlyFees[monthYear] = 0;
        }
        monthlyFees[monthYear] += payment.amount;
      });
    });

    // Generate last 12 months data
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      feePaymentsByMonth.push({
        month: monthName,
        amount: monthlyFees[monthYear] || 0
      });
    }

    // Get students by class
    const classes = await Class.find().populate('students');
    const studentsByClass = classes.map(cls => ({
      className: cls.name,
      count: cls.students.length
    }));

    // Get income vs expense for the last 12 months
    const incomeVsExpense = [];
    const teachers = await Teacher.find();
    const monthlySalaries = {};
    
    teachers.forEach(teacher => {
      teacher.salaryPayments.forEach(payment => {
        const paymentDate = new Date(payment.paymentDate);
        const monthYear = `${paymentDate.getFullYear()}-${paymentDate.getMonth() + 1}`;
        if (!monthlySalaries[monthYear]) {
          monthlySalaries[monthYear] = 0;
        }
        monthlySalaries[monthYear] += payment.amount;
      });
    });

    // Generate last 12 months data for income vs expense
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      incomeVsExpense.push({
        month: monthName,
        income: monthlyFees[monthYear] || 0,
        expense: monthlySalaries[monthYear] || 0
      });
    }

    // Get recent activities
    const recentActivities = [
      { type: 'student', message: 'New student registered', time: '2 hours ago' },
      { type: 'fee', message: 'Fee payment recorded', time: '5 hours ago' },
      { type: 'class', message: 'New class created', time: '1 day ago' },
      { type: 'salary', message: 'Teacher salary paid', time: '2 days ago' }
    ];

    res.json({
      totals: {
        students: totalStudents,
        teachers: totalTeachers,
        classes: totalClasses
      },
      charts: {
        feePaymentsByMonth,
        studentsByClass,
        incomeVsExpense
      },
      recentActivities
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;