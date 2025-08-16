const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

// Get all salary payments with pagination, search and filter
router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sortBy || "paymentDate";
    const sortOrder = req.query.sortOrder || "desc";

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const teachers = await Teacher.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Teacher.countDocuments(query);

    // Flatten payments for display
    const payments = [];
    teachers.forEach((teacher) => {
      teacher.salaryPayments.forEach((payment) => {
        payments.push({
          ...payment.toObject(),
          teacherId: teacher._id,
          teacherName: teacher.name,
          subject: teacher.subject,
          baseSalary: teacher.baseSalary,
        });
      });
    });

    // Calculate analytics
    const analytics = {
      totalSalariesPaid: payments.reduce((sum, p) => sum + p.amount, 0),
      currentMonthSalaries: payments
        .filter(
          (p) =>
            p.month === new Date().toLocaleString("default", { month: "long" })
        )
        .reduce((sum, p) => sum + p.amount, 0),
      currentYearSalaries: payments
        .filter((p) => p.paymentDate.getFullYear() === new Date().getFullYear())
        .reduce((sum, p) => sum + p.amount, 0),
    };

    res.json({
      payments,
      analytics,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new salary payment
router.post("/", auth, roleAuth(["super", "sub"]), async (req, res) => {
  try {
    const {
      teacherId,
      month,
      amount,
      paymentMethod,
      status = "Paid",
      notes,
    } = req.body;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if payment for this month already exists
    const existingPayment = teacher.salaryPayments.find(
      (p) => p.month === month
    );
    if (existingPayment) {
      return res
        .status(400)
        .json({ message: "Salary payment for this month already exists" });
    }

    const newPayment = {
      month,
      amount,
      paymentMethod,
      status,
      notes: notes || "",
      paidBy: req.admin._id,
    };

    teacher.salaryPayments.push(newPayment);
    await teacher.save();

    res.status(201).json({ message: "Salary payment recorded successfully" });
  } catch (err) {
    console.error("Error recording salary payment:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get teacher payment history
router.get("/teacher/:teacherId", auth, async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({
      teacher: {
        name: teacher.name,
        subject: teacher.subject,
        baseSalary: teacher.baseSalary,
      },
      payments: teacher.salaryPayments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update salary payment
router.put(
  "/:teacherId/:paymentId",
  auth,
  roleAuth(["super"]),
  async (req, res) => {
    try {
      const { month, amount, paymentMethod, status, notes } = req.body;
      const { teacherId, paymentId } = req.params;

      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const payment = teacher.salaryPayments.id(paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      payment.month = month || payment.month;
      payment.amount = amount || payment.amount;
      payment.paymentMethod = paymentMethod || payment.paymentMethod;
      payment.status = status || payment.status;
      payment.notes = notes !== undefined ? notes : payment.notes;

      await teacher.save();
      res.json({ message: "Salary payment updated successfully" });
    } catch (err) {
      console.error("Error updating salary payment:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete salary payment
router.delete(
  "/:teacherId/:paymentId",
  auth,
  roleAuth(["super"]),
  async (req, res) => {
    try {
      const { teacherId, paymentId } = req.params;

      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      teacher.salaryPayments = teacher.salaryPayments.filter(
        (p) => p._id.toString() !== paymentId
      );
      await teacher.save();

      res.json({ message: "Salary payment deleted successfully" });
    } catch (err) {
      console.error("Error deleting salary payment:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
