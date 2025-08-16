const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const Class = require("../models/Class");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

// Helper function to generate receipt number
function generateReceiptNo() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `RCPT-${timestamp}-${random}`;
}

// Get all fee payments with pagination, search and filter
router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const classFilter = req.query.class || "";
    const monthFilter = req.query.month || "";
    const paymentMethodFilter = req.query.paymentMethod || "";
    const sortBy = req.query.sortBy || "paymentDate";
    const sortOrder = req.query.sortOrder || "desc";

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (classFilter) {
      query.class = classFilter;
    }

    const students = await Student.find(query)
      .populate("class", "name")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Student.countDocuments(query);

    // Flatten payments for display
    const payments = [];
    students.forEach((student) => {
      student.feeStatus.forEach((payment) => {
        if (!monthFilter || payment.month === monthFilter) {
          if (
            !paymentMethodFilter ||
            payment.paymentMethod === paymentMethodFilter
          ) {
            payments.push({
              ...payment.toObject(),
              studentId: student._id,
              studentName: student.name,
              className: student.class?.name || "N/A",
            });
          }
        }
      });
    });

    // Calculate analytics
    const analytics = {
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      currentMonthRevenue: payments
        .filter(
          (p) =>
            p.month === new Date().toLocaleString("default", { month: "long" })
        )
        .reduce((sum, p) => sum + p.amount, 0),
      revenueByClass: {},
    };

    // Calculate revenue by class
    payments.forEach((payment) => {
      if (!analytics.revenueByClass[payment.className]) {
        analytics.revenueByClass[payment.className] = 0;
      }
      analytics.revenueByClass[payment.className] += payment.amount;
    });

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

// Add new fee payment
router.post("/", auth, roleAuth(["super", "sub"]), async (req, res) => {
  try {
    const {
      studentId,
      month,
      amount,
      paymentMethod,
      status = "Paid",
    } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Check if payment for this month already exists
    const existingPayment = student.feeStatus.find((p) => p.month === month);
    if (existingPayment) {
      return res
        .status(400)
        .json({ message: "Payment for this month already exists" });
    }

    const receiptNo = generateReceiptNo();
    const newPayment = {
      month,
      amount,
      paymentMethod,
      status,
      receiptNo,
      paidBy: req.admin._id,
    };

    student.feeStatus.push(newPayment);
    await student.save();

    res
      .status(201)
      .json({ message: "Payment recorded successfully", receiptNo });
  } catch (err) {
    console.error("Error recording payment:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get student payment history
router.get("/student/:studentId", auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).populate(
      "class",
      "name"
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student.feeStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get debt report
router.get("/debt-report", auth, async (req, res) => {
  try {
    const students = await Student.find().populate("class", "name");

    const debtReport = [];
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });

    students.forEach((student) => {
      const currentPayment = student.feeStatus.find(
        (p) => p.month === currentMonth
      );
      if (!currentPayment || currentPayment.status === "Debt") {
        const totalPaid = student.feeStatus
          .filter((p) => p.status === "Paid")
          .reduce((sum, p) => sum + p.amount, 0);

        debtReport.push({
          studentId: student._id,
          studentName: student.name,
          className: student.class?.name || "N/A",
          totalPaid,
          debtAmount: currentPayment ? currentPayment.amount : 0,
        });
      }
    });

    res.json(debtReport);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update payment
router.put(
  "/:studentId/:paymentId",
  auth,
  roleAuth(["super"]),
  async (req, res) => {
    try {
      const { month, amount, paymentMethod, status } = req.body;
      const { studentId, paymentId } = req.params;

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const payment = student.feeStatus.id(paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      payment.month = month || payment.month;
      payment.amount = amount || payment.amount;
      payment.paymentMethod = paymentMethod || payment.paymentMethod;
      payment.status = status || payment.status;

      await student.save();
      res.json({ message: "Payment updated successfully" });
    } catch (err) {
      console.error("Error updating payment:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// Delete payment
router.delete(
  "/:studentId/:paymentId",
  auth,
  roleAuth(["super"]),
  async (req, res) => {
    try {
      const { studentId, paymentId } = req.params;

      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      student.feeStatus = student.feeStatus.filter(
        (p) => p._id.toString() !== paymentId
      );
      await student.save();

      res.json({ message: "Payment deleted successfully" });
    } catch (err) {
      console.error("Error deleting payment:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
